package vehicle_log

import appErrors "backend/internal/common/errors"

type SlotStatus string

const (
	SlotStatusAvailable SlotStatus = "AVAILABLE"
	SlotStatusOccupied  SlotStatus = "OCCUPIED"
	SlotStatusMaintain  SlotStatus = "MAINTAIN"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(log *VehicleLog) error {
	if err := s.repo.Create(log); err != nil {
		return appErrors.NewInternal("Không thể tạo nhật ký xe")
	}

	return nil
}

func (s *Service) FindBySlotID(slotID uint) ([]VehicleLog, error) {
	logs, err := s.repo.FindBySlotID(slotID)
	if err != nil {
		return nil, appErrors.NewInternal("Không thể lấy lịch sử bãi đỗ")
	}

	return logs, nil
}

func (s *Service) RecordByStatusTransition(slotID uint, oldStatus, newStatus SlotStatus) error {
	var logType LogType

	switch {
	case oldStatus == SlotStatusAvailable && newStatus == SlotStatusOccupied:
		logType = LogTypeIn
	case oldStatus == SlotStatusOccupied && newStatus == SlotStatusAvailable:
		logType = LogTypeOut
	default:
		return nil
	}

	return s.Create(&VehicleLog{
		SlotID: slotID,
		Type:   logType,
	})
}
