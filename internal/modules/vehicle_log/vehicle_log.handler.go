package vehicle_log

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

func (h *Handler) GetLogsBySlotID(c *gin.Context) {
	slotIDParam := c.Param("slotId")
	slotID64, err := strconv.ParseUint(slotIDParam, 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("slotId không hợp lệ"))
		return
	}

	logs, err := h.service.FindBySlotID(uint(slotID64))
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy lịch sử xe thành công", logs)
}
