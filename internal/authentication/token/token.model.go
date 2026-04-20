package token

import "time"

type RefreshToken struct {
	ID        uint      `GORM:"primaryKey;autoIncrement"`
	TokenHash string    `GORM:"type:varchar(255);not null;uniqueIndex"`
	Device    *string   `GORM:"type:varchar(100)"`
	IP        *string   `GORM:"type:varchar(45)"`
	ExpiresAt time.Time `GORM:"not null;index"`
	CreatedAt time.Time `GORM:"autoCreateTime"`
	UserID    uint      `GORM:"not null;index"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}
