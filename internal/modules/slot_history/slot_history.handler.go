package slot_history

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

func (h *Handler) GetBySlotID(c *gin.Context) {
	var params GetSlotHistoryBySlotIDParams
	if err := c.ShouldBindUri(&params); err != nil {
		c.Error(appErrors.NewBadRequest("slotId không hợp lệ"))
		return
	}

	history, err := h.service.FindBySlotID(params.SlotID)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy lịch sử thành công", history)
}
