package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	appErrors "backend/internal/common/errors"
	"backend/pkg/response"
)

type verifiedPageRenderer interface {
	RenderVerifiedPage(year int) (string, error)
}

type Handler struct {
	service     *Service
	mailService verifiedPageRenderer
}

func NewHandler(service *Service, mailService verifiedPageRenderer) *Handler {
	return &Handler{
		service:     service,
		mailService: mailService,
	}
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	if err := h.service.Register(req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 201, "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.", nil)
}

func (h *Handler) VerifyEmail(c *gin.Context) {
	email := c.Query("email")
	code := c.Query("code")

	if email == "" || code == "" {
		c.Error(appErrors.NewBadRequest("Thiếu email hoặc code"))
		return
	}

	if err := h.service.VerifyEmail(VerifyEmailRequest{
		Email: email,
		Code:  code,
	}); err != nil {
		c.Error(err)
		return
	}

	html, err := h.mailService.RenderVerifiedPage(time.Now().Year())
	if err != nil {
		c.Error(appErrors.NewInternal("Render trang xác thực thất bại"))
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

func (h *Handler) ResendVerification(c *gin.Context) {
	var req EmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	if err := h.service.ResendVerificationEmail(req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Resend email successful", nil)
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	ip := c.ClientIP()

	u, err := h.service.ValidateUser(req.Email, req.Password, ip)
	if err != nil {
		c.Error(err)
		return
	}

	device := c.GetHeader("User-Agent")

	data, refreshToken, err := h.service.Login(u, device, ip)
	if err != nil {
		c.Error(err)
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", refreshToken, 7*24*60*60, "/", "", false, true)

	response.Success(c, 200, "Đăng nhập thành công", data)
}

func (h *Handler) Logout(c *gin.Context) {
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

	jtiValue, _ := c.Get("jti")
	jti, _ := jtiValue.(string)

	expValue, _ := c.Get("exp")
	var ttl time.Duration
	if expUnix, ok := expValue.(int64); ok {
		ttl = time.Until(time.Unix(expUnix, 0))
	}

	refreshToken, _ := c.Cookie("refresh_token")

	if err := h.service.Logout(userID, refreshToken, jti, ttl); err != nil {
		c.Error(err)
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	response.Success(c, 200, "Đăng xuất thành công", nil)
}

func (h *Handler) RefreshToken(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		c.Error(appErrors.NewUnauthorized("Missing refresh token"))
		return
	}

	data, err := h.service.Refresh(refreshToken)
	if err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Làm mới token thành công", data)
}

func (h *Handler) SendResetPassword(c *gin.Context) {
	var req EmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	if err := h.service.SendResetPasswordEmail(req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Password reset email sent successfully", nil)
}

func (h *Handler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErrors.NewBadRequest("Dữ liệu không hợp lệ"))
		return
	}

	if err := h.service.ResetPassword(req); err != nil {
		c.Error(err)
		return
	}

	response.Success(c, 200, "Password reset successfully", nil)
}
