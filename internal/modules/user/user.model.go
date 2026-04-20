package user

import "time"

type Role string

const (
	RoleUser    Role = "USER"
	RoleManager Role = "MANAGER"
	RoleAdmin   Role = "ADMIN"
)

type User struct {
	ID         uint      `GORM:"primaryKey;autoIncrement"`
	FirstName  string    `GORM:"type:varchar(100);not null"`
	LastName   string    `GORM:"type:varchar(100);not null"`
	Email      string    `GORM:"type:varchar(255);not null;uniqueIndex"`
	Password   string    `GORM:"type:varchar(255);not null"`
	Role       Role      `GORM:"type:enum('USER','MANAGER','ADMIN');default:'USER';not null"`
	IsVerified bool      `GORM:"default:false;not null"`
	CreatedAt  time.Time `GORM:"autoCreateTime"`
	UpdatedAt  time.Time `GORM:"autoUpdateTime"`
}

func (User) TableName() string {
	return "users"
}
