package iot_device

import "time"

type DeviceStatus string

const (
	DeviceStatusActive   DeviceStatus = "ACTIVE"
	DeviceStatusInactive DeviceStatus = "INACTIVE"
	DeviceStatusError    DeviceStatus = "ERROR"
)

type IoTDevice struct {
	MacAddress string       `GORM:"primaryKey;type:varchar(50)"`
	DeviceName *string      `GORM:"type:varchar(50)"`
	Status     DeviceStatus `GORM:"type:enum('ACTIVE','INACTIVE','ERROR');default:'ACTIVE';not null"`
	LotID      *uint        `GORM:"index"`
	LastSeen   *time.Time
	CreatedAt  time.Time `GORM:"autoCreateTime"`
	UpdatedAt  time.Time `GORM:"autoUpdateTime"`
}

func (IoTDevice) TableName() string {
	return "iot_devices"
}
