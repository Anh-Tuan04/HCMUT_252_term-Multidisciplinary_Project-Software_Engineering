package vehicle_log

import appErrors "backend/internal/common/errors"

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
