package routes

import (
	"github.com/gin-gonic/gin"

	"backend/internal/modules/iot_device"
)

func RegisterIoTDeviceRoutes(api *gin.RouterGroup, handler *iot_device.Handler) {
	iotDevices := api.Group("/iot-devices")
	{
		iotDevices.POST("", handler.CreateDevice)
	}
}
