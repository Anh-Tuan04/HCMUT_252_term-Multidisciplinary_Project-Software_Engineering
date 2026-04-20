package parking_slot

import "time"

type SlotStatus string

const (
	SlotStatusAvailable SlotStatus = "AVAILABLE"
	SlotStatusOccupied  SlotStatus = "OCCUPIED"
	SlotStatusMaintain  SlotStatus = "MAINTAIN"
	SlotStatusOffline   SlotStatus = "OFFLINE"
)

type ParkingSlot struct {
	ID         uint       `GORM:"primaryKey;autoIncrement"`
	Name       string     `GORM:"type:varchar(10);not null;uniqueIndex:uk_lot_name"`
	LotID      uint       `GORM:"not null;index;uniqueIndex:uk_lot_name;index:idx_lot_status"`
	DeviceMac  string     `GORM:"type:varchar(50);not null;index;uniqueIndex:uk_device_port"`
	PortNumber int        `GORM:"not null;uniqueIndex:uk_device_port"`
	Status     SlotStatus `GORM:"type:enum('AVAILABLE','OCCUPIED','MAINTAIN','OFFLINE');default:'AVAILABLE';not null;index:idx_lot_status"`
	CreatedAt  time.Time  `GORM:"autoCreateTime"`
	UpdatedAt  time.Time  `GORM:"autoUpdateTime"`
}

func (ParkingSlot) TableName() string {
	return "parking_slots"
}
