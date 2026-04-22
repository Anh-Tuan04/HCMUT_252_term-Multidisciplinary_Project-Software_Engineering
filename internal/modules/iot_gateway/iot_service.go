package iot_gateway

import (
	"fmt"
	"strings"
	"time"

	appErrors "backend/internal/common/errors"
	"backend/internal/modules/gate"
	"backend/internal/modules/parking_session"
	"backend/internal/modules/rfid_card"
)

type Service struct {
	plateCache     *PlateCache
	gateService    *gate.Service
	rfidService    *rfid_card.Service
	sessionService *parking_session.Service
}

func NewService(
	plateCache *PlateCache,
	gateService *gate.Service,
	rfidService *rfid_card.Service,
	sessionService *parking_session.Service,
) *Service {
	return &Service{
		plateCache:     plateCache,
		gateService:    gateService,
		rfidService:    rfidService,
		sessionService: sessionService,
	}
}

// HandleCameraPlate lưu biển số tạm trong PlateCache theo gateID
func (s *Service) HandleCameraPlate(req *CameraPlateRequest) (*CameraPlateResponse, error) {
	g, err := s.gateService.FindByID(req.GateID)
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok && appErr.StatusCode == 404 {
			return &CameraPlateResponse{Success: false, Message: "Cổng không tồn tại"}, nil
		}
		return nil, appErrors.NewInternal("Lỗi kiểm tra cổng")
	}
	if !g.IsActive {
		return &CameraPlateResponse{Success: false, Message: "Cổng không hoạt động"}, nil
	}

	plateNumber := strings.TrimSpace(req.PlateNumber)
	if plateNumber == "" {
		return nil, appErrors.NewBadRequest("Biển số không được để trống")
	}

	s.plateCache.Set(req.GateID, plateNumber)

	return &CameraPlateResponse{
		Success: true,
		Message: "Đã lưu biển số từ camera",
	}, nil
}

// HandleRfidScan xử lý toàn bộ luồng khi ESP32 quẹt thẻ RFID
func (s *Service) HandleRfidScan(req *RfidScanRequest) (*RfidScanResponse, error) {
	// 1. Validate gate tồn tại và isActive
	g, err := s.gateService.FindByID(req.GateID)
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok && appErr.StatusCode == 404 {
			return rejectResponse("Cổng không tồn tại"), nil
		}
		return nil, appErrors.NewInternal("Lỗi kiểm tra cổng")
	}
	if !g.IsActive {
		return rejectResponse("Cổng không hoạt động"), nil
	}

	// 2. Kiểm tra macAddress khớp với gate
	if g.MacAddress != req.MacAddress {
		return rejectResponse("MAC address không khớp với cổng"), nil
	}

	// 3. Tìm thẻ RFID theo UID
	card, err := s.rfidService.FindByUID(req.RfidUID)
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok && appErr.StatusCode == 404 {
			return rejectResponse("Thẻ không tồn tại"), nil
		}
		return nil, appErrors.NewInternal("Lỗi kiểm tra thẻ RFID")
	}
	if !card.IsActive {
		return rejectResponse("Thẻ đã bị vô hiệu hoá"), nil
	}

	// 4. Lấy biển số từ PlateCache (consume = lấy rồi xóa)
	plateNumber, ok := s.plateCache.Consume(req.GateID)
	if !ok {
		return rejectResponse("Chưa có biển số từ camera, vui lòng thử lại"), nil
	}

	// 5. Xử lý theo loại cổng
	switch g.Type {
	case gate.GateTypeEntry:
		return s.handleEntry(g, card, plateNumber)
	case gate.GateTypeExit:
		return s.handleExit(card, plateNumber)
	default:
		return rejectResponse("Loại cổng không hợp lệ"), nil
	}
}

// handleEntry xử lý xe vào
func (s *Service) handleEntry(
	g *gate.Gate,
	card *rfid_card.RfidCard,
	plateNumber string,
) (*RfidScanResponse, error) {
	// Kiểm tra không có session đang active với thẻ này
	existing, err := s.sessionService.FindActiveByCardUID(card.UID)
	if err == nil && existing != nil {
		return rejectResponse("Thẻ đang có phiên gửi xe chưa kết thúc"), nil
	}

	// Tạo session mới
	_, err = s.sessionService.Create(parking_session.CreateParkingSessionInput{
		LotID:       g.LotID,
		CardUID:     card.UID,
		CardType:    string(card.CardType),
		PlateNumber: plateNumber,
	})
	if err != nil {
		return nil, err
	}

	return &RfidScanResponse{
		Success:  true,
		Action:   "open_barrier",
		LCDLine1: fmt.Sprintf("BS:%s", plateNumber),
		LCDLine2: "Moi vao!",
		Message:  "Tạo phiên gửi xe thành công",
	}, nil
}

// handleExit xử lý xe ra
func (s *Service) handleExit(
	card *rfid_card.RfidCard,
	plateNumber string,
) (*RfidScanResponse, error) {
	// Tìm session đang active
	session, err := s.sessionService.FindActiveByCardUID(card.UID)
	if err != nil {
		return rejectResponse("Không có phiên gửi xe đang hoạt động"), nil
	}

	// Tính phí (đơn giản theo giờ, có thể thay bằng logic riêng)
	fee := calculateFee(session)

	// Kết thúc session
	_, err = s.sessionService.FinishSession(parking_session.FinishParkingSessionInput{
		SessionID: session.ID,
		Fee:       fee,
	})
	if err != nil {
		return nil, err
	}

	return &RfidScanResponse{
		Success:  true,
		Action:   "open_barrier",
		LCDLine1: fmt.Sprintf("BS:%s", plateNumber),
		LCDLine2: fmt.Sprintf("Phi:%-.0fVND", fee),
		Message:  "Kết thúc phiên gửi xe thành công",
	}, nil
}

// ─── helpers ─────────────────────────────────────────────────────────────────

func rejectResponse(msg string) *RfidScanResponse {
	return &RfidScanResponse{
		Success:  false,
		Action:   "reject",
		LCDLine1: "Khong hop le",
		LCDLine2: msg,
		Message:  msg,
	}
}

// calculateFee tính phí đơn giản: 5000đ/giờ, tối thiểu 5000đ
func calculateFee(session *parking_session.ParkingSession) float64 {
	const ratePerHour = 5000.0
	hours := time.Since(session.EntryTime).Hours()
	if hours < 1 {
		hours = 1
	}
	return hours * ratePerHour
}
