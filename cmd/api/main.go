package main

import (
	"backend/configs"
	"backend/internal/modules/iot_device"
	"backend/internal/modules/slot_history"
	"backend/internal/modules/vehicle_log"
	"backend/pkg/database"
	"backend/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := configs.LoadConfig()
	db := database.NewMySQL(cfg)

	iotDeviceModule := iot_device.NewModule(db)
	vehicleLogModule := vehicle_log.NewModule(db)
	slotHistoryModule := slot_history.NewModule(db)
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.ErrorHandler())

	api := r.Group("/api/v1")

	iot_device.RegisterRoutes(api, iotDeviceModule.Handler)
	vehicle_log.RegisterRoutes(api, vehicleLogModule.Handler)
	slot_history.RegisterRoutes(api, slotHistoryModule.Handler)

	_ = r.Run(":" + cfg.AppPort)
}
