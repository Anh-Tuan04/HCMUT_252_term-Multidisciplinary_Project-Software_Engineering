package parking_lot

import (
	"backend/internal/modules/parking_slot"
	"time"
)

type ParkingLot struct {
	ID        uint                       `gorm:"primaryKey;autoIncrement"`
	Name      string                     `gorm:"type:varchar(100);not null"`
	Location  *string                    `gorm:"type:varchar(255)"`
	CreatedAt time.Time                  `gorm:"autoCreateTime"`
	UpdatedAt time.Time                  `gorm:"autoUpdateTime"`
	Slots     []parking_slot.ParkingSlot `gorm:"foreignKey:LotID;references:ID"`
}

func (ParkingLot) TableName() string {
	return "parking_lots"
}
