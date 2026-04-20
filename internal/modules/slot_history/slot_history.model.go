package slot_history

import "time"

type SlotHistoryAction string

const (
	SlotHistoryActionDeviceChange SlotHistoryAction = "DEVICE_CHANGE"
	SlotHistoryActionStatusChange SlotHistoryAction = "STATUS_CHANGE"
	SlotHistoryActionSystemFix    SlotHistoryAction = "SYSTEM_FIX"
	SlotHistoryActionMaintainMode SlotHistoryAction = "MAINTAIN_MODE"
)

type SlotHistory struct {
	ID        uint    `GORM:"primaryKey;autoIncrement"`
	SlotID    uint    `GORM:"not null;index;index:idx_slot_created_at"`
	OldDevice *string `GORM:"type:varchar(50)"`
	NewDevice *string `GORM:"type:varchar(50)"`
	OldPort   *int
	NewPort   *int
	Action    SlotHistoryAction `GORM:"type:enum('DEVICE_CHANGE','STATUS_CHANGE','SYSTEM_FIX','MAINTAIN_MODE');default:'DEVICE_CHANGE';not null"`
	UserID    *uint             `GORM:"index"`
	CreatedAt time.Time         `GORM:"autoCreateTime;index;index:idx_slot_created_at"`
}

func (SlotHistory) TableName() string {
	return "slot_histories"
}
