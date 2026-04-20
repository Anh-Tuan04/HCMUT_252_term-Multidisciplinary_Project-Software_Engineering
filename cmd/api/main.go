package main

import (
	"backend/configs"
	"backend/internal/modules/iot_device"
	"backend/pkg/database"
)

func main() {
	cfg := configs.LoadConfig()
	db := database.NewMySQL(cfg)

	iotDeviceModule := iot_device.NewModule(db)

	_ = iotDeviceModule
}
