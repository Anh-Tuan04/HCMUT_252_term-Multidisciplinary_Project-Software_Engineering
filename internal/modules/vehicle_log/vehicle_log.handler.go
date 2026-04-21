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

// GetLogsBySlotID godoc
// @Summary Lấy lịch sử xe theo vị trí đỗ
// @Description Trả về lịch sử xe ra vào hoặc hoạt động theo slot ID
// @Tags vehicle_log
// @Produce json
// @Security BearerAuth
// @Param slotId path int true "ID vị trí đỗ xe"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /parking-slots/{slotId}/vehicle-logs [get]
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
