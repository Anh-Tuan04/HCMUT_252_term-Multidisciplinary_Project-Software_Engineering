package parking_lot

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
	var req CreateParkingLotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	lot, err := h.service.Create(req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 201, "Tạo bãi đỗ thành công", lot)
}

func (h *Handler) FindAll(c *gin.Context) {
	lots, err := h.service.FindAll()
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy danh sách bãi đỗ thành công", lots)
}

func (h *Handler) FindByID(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	lot, err := h.service.FindByID(uint(id64))
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy thông tin bãi đỗ thành công", lot)
}

func (h *Handler) Update(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	var req UpdateParkingLotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	lot, err := h.service.Update(uint(id64), req)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Cập nhật bãi đỗ thành công", lot)
}
