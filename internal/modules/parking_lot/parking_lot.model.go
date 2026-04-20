package parking_lot

import (
	"backend/internal/modules/parking_slot"
	"time"
)

type ParkingLot struct {
	ID        uint                       `GORM:"primaryKey;autoIncrement"`
	Name      string                     `GORM:"type:varchar(100);not null"`
	Location  *string                    `GORM:"type:varchar(255)"`
	CreatedAt time.Time                  `GORM:"autoCreateTime"`
	UpdatedAt time.Time                  `GORM:"autoUpdateTime"`
	Slots     []parking_slot.ParkingSlot `GORM:"foreignKey:LotID;references:ID"`
}

func (ParkingLot) TableName() string {
	return "parking_lots"
}
