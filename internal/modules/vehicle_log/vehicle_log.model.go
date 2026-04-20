package vehicle_log

import "time"

type LogType string

const (
	LogTypeIn  LogType = "IN"
	LogTypeOut LogType = "OUT"
)

type VehicleLog struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	SlotID    uint      `gorm:"not null;index;index:idx_slot_created_at"`
	Type      LogType   `gorm:"type:enum('IN','OUT');not null"`
	CreatedAt time.Time `gorm:"autoCreateTime;index;index:idx_slot_created_at"`
}

func (VehicleLog) TableName() string {
	return "vehicle_logs"
}
