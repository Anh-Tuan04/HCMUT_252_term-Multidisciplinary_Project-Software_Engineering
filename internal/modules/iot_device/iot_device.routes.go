package iot_device

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(api *gin.RouterGroup, handler *Handler) {
	iotDevices := api.Group("/iot-devices")
	{
		iotDevices.POST("", handler.CreateDevice)
	}
}
