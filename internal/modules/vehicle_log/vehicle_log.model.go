package vehicle_log

import "time"

type LogType string

const (
	LogTypeIn  LogType = "IN"
	LogTypeOut LogType = "OUT"
)

type VehicleLog struct {
	ID        uint      `GORM:"primaryKey;autoIncrement"`
	SlotID    uint      `GORM:"not null;index;index:idx_slot_created_at"`
	Type      LogType   `GORM:"type:enum('IN','OUT');not null"`
	CreatedAt time.Time `GORM:"autoCreateTime;index;index:idx_slot_created_at"`
}

func (VehicleLog) TableName() string {
	return "vehicle_logs"
}
