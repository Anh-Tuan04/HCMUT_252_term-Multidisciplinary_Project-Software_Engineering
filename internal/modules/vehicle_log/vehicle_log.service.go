package vehicle_log

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(log *VehicleLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) FindBySlotID(slotID uint) ([]VehicleLog, error) {
	var logs []VehicleLog
	err := r.db.
		Where("slot_id = ?", slotID).
		Order("created_at DESC").
		Find(&logs).Error
	if err != nil {
		return nil, err
	}
	return logs, nil
}
