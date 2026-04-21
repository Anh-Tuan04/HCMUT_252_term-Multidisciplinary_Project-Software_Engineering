package main

import (
	"backend/configs"
	"backend/internal/auth"
	authmail "backend/internal/auth/mail"
	"backend/internal/auth/token"
	"backend/internal/modules/iot_device"
	"backend/internal/modules/parking_lot"
	"backend/internal/modules/slot_history"
	"backend/internal/modules/user"
	"backend/internal/modules/vehicle_log"
	"backend/pkg/database"
	"backend/pkg/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := configs.LoadConfig()

	db := database.NewMySQL(cfg)
	redisClient := database.NewRedis(cfg)
	defer redisClient.Close()

	tokenService := token.NewService(cfg)
	mailService := authmail.NewService(cfg)
	authMiddleware := middleware.Auth(tokenService, redisClient)
	adminOnly := middleware.RequireRoles(user.RoleAdmin)
	managerOrAdmin := middleware.RequireRoles(user.RoleManager, user.RoleAdmin)

	authModule := auth.NewModule(db, redisClient, tokenService, mailService)
	iotDeviceModule := iot_device.NewModule(db)
	vehicleLogModule := vehicle_log.NewModule(db)
	slotHistoryModule := slot_history.NewModule(db)
	parkingLotModule := parking_lot.NewModule(db)
	userModule := user.NewModule(db)

	r := gin.New()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.ErrorHandler())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "up",
			"message": "Service is running perfectly",
		})
	})
	api := r.Group("/api/v1")

	auth.RegisterRoutes(api, authModule.Handler, authMiddleware)
	iot_device.RegisterRoutes(api, iotDeviceModule.Handler, authMiddleware, managerOrAdmin)
	vehicle_log.RegisterRoutes(api, vehicleLogModule.Handler, authMiddleware, managerOrAdmin)
	slot_history.RegisterRoutes(api, slotHistoryModule.Handler, authMiddleware, managerOrAdmin)
	parking_lot.RegisterRoutes(api, parkingLotModule.Handler, authMiddleware, managerOrAdmin)
	user.RegisterRoutes(api, userModule.Handler, authMiddleware, adminOnly)

	_ = r.Run(":" + cfg.AppPort)
}
