package user

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

func (h *Handler) FindWithPagination(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	result, err := h.service.FindWithPagination(page, limit, search)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Lấy danh sách người dùng thành công", result)
}

func (h *Handler) CreateByAdmin(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	if err := h.service.CreateUserByAdmin(req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 201, "Tạo người dùng thành công", nil)
}

func (h *Handler) ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.Error(appErrors.NewUnauthorized("Unauthorized"))
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErrors.NewUnauthorized("Unauthorized"))
		return
	}

	if err := h.service.ChangePassword(userID, req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Đổi mật khẩu thành công", nil)
}

func (h *Handler) ChangeRole(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.Error(appErrors.NewBadRequest("id không hợp lệ"))
		return
	}

	var req ChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	if err := h.service.ChangeRole(uint(id64), req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Đổi vai trò thành công", nil)
}
