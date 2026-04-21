package parking_slot

import (
	"strconv"

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

func (h *Handler) Create(c *gin.Context) {
	var req CreateParkingSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	slot, err := h.service.Create(req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 201, "Tạo vị trí đỗ thành công", slot)
}

func (h *Handler) FindByID(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	slot, err := h.service.FindByID(uint(id64))
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy thông tin vị trí đỗ thành công", slot)
}

func (h *Handler) AdminUpdateStatus(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	var req AdminUpdateParkingSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	result, err := h.service.AdminUpdateStatus(uint(id64), req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, result.Message, result)
}

func (h *Handler) SensorUpdateStatus(c *gin.Context) {
	var req SensorUpdateParkingSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	result, err := h.service.SensorUpdateStatus(req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, result.Message, result)
}

func (h *Handler) ChangeDevice(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	var req ChangeSlotDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	_, err = h.service.ChangeDevice(uint(id64), req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Cập nhật thiết bị thành công", nil)
}
