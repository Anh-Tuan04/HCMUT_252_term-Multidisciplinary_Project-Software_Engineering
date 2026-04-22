package parking_session

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

func (h *Handler) FindAll(c *gin.Context) {
	sessions, err := h.service.FindAll()
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy danh sách phiên gửi xe thành công", sessions)
}

func (h *Handler) FindByID(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	session, err := h.service.FindByID(uint(id64))
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy thông tin phiên gửi xe thành công", session)
}
