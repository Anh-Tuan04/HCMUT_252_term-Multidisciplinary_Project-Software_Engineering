package iot_device

import (
	"github.com/gin-gonic/gin"

	appErrors "backend/internal/common/errors"
	"backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) CreateDevice(c *gin.Context) {
	var req CreateIoTDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	device, err := h.service.CreateDevice(req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 201, "Tạo thiết bị IoT thành công", device)
}
