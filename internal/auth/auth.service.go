package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"backend/internal/auth/mail"
	"backend/internal/auth/token"
	appErrors "backend/internal/common/errors"
	"backend/internal/modules/user"
	"backend/pkg/database"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo         *Repository
	tokenService *token.Service
	mailService  *mail.Service
	redis        *database.RedisClient
}

func NewService(
	repo *Repository,
	tokenService *token.Service,
	mailService *mail.Service,
	redis *database.RedisClient,
) *Service {
	return &Service{
		repo:         repo,
		tokenService: tokenService,
		mailService:  mailService,
		redis:        redis,
	}
}

func sha256Hex(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func normalizeEmail(email string) string {
	return strings.TrimSpace(strings.ToLower(email))
}

func verifyEmailKey(r *database.RedisClient, userID uint) string {
	return r.Key("auth", "verify_email", "user", userID)
}

func resetPasswordKey(r *database.RedisClient, userID uint) string {
	return r.Key("auth", "reset_password", "user", userID)
}

func loginFailEmailKey(r *database.RedisClient, email string) string {
	return r.Key("auth", "login_fail", "email", normalizeEmail(email))
}

func loginFailIPKey(r *database.RedisClient, ip string) string {
	return r.Key("auth", "login_fail", "ip", ip)
}

func revokedAccessKey(r *database.RedisClient, jti string) string {
	return r.Key("auth", "revoked_access", "jti", jti)
}

func (s *Service) Register(req RegisterRequest) error {
	req.Email = normalizeEmail(req.Email)
	req.FirstName = strings.TrimSpace(req.FirstName)
	req.LastName = strings.TrimSpace(req.LastName)

	exist, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return appErrors.NewInternal("Kiểm tra email thất bại")
	}
	if exist != nil {
		return appErrors.NewConflict("Email đã được đăng ký!")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return appErrors.NewInternal("Mã hóa mật khẩu thất bại")
	}

	u := &user.User{
		Email:      req.Email,
		Password:   string(hashedPassword),
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Role:       user.RoleUser,
		IsVerified: false,
	}

	if err := s.repo.CreateUser(u); err != nil {
		return appErrors.NewInternal("Tạo tài khoản thất bại")
	}

	code := uuid.NewString()
	key := verifyEmailKey(s.redis, u.ID)

	if err := s.redis.HSet(key,
		"code_hash", sha256Hex(code),
		"attempts", 0,
	); err != nil {
		return appErrors.NewInternal("Lưu mã xác thực thất bại")
	}
	if err := s.redis.Expire(key, 5*time.Minute); err != nil {
		return appErrors.NewInternal("Đặt TTL mã xác thực thất bại")
	}

	verifyURL := s.mailService.BuildVerificationURL(u.Email, code)
	if err := s.mailService.SendVerificationEmail(u.Email, u.FirstName, verifyURL); err != nil {
		return appErrors.NewInternal("Gửi mail thất bại")
	}

	return nil
}

func (s *Service) VerifyEmail(req VerifyEmailRequest) error {
	req.Email = normalizeEmail(req.Email)

	u, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return appErrors.NewInternal("Lấy thông tin người dùng thất bại")
	}
	if u == nil {
		return appErrors.NewBadRequest("Email không tồn tại")
	}
	if u.IsVerified {
		return appErrors.NewBadRequest("Email đã được xác thực")
	}

	key := verifyEmailKey(s.redis, u.ID)
	data, err := s.redis.HGetAll(key)
	if err != nil {
		return appErrors.NewInternal("Lấy mã xác thực thất bại")
	}
	if len(data) == 0 || data["code_hash"] != sha256Hex(req.Code) {
		_, _ = s.redis.HIncrBy(key, "attempts", 1)
		return appErrors.NewBadRequest("Mã xác thực không hợp lệ hoặc đã hết hạn")
	}

	if err := s.repo.UpdateUserVerified(u.ID, true); err != nil {
		return appErrors.NewInternal("Cập nhật trạng thái xác thực thất bại")
	}

	_ = s.redis.Delete(key)
	return nil
}

func (s *Service) ResendVerificationEmail(req EmailRequest) error {
	req.Email = normalizeEmail(req.Email)

	u, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return appErrors.NewInternal("Lấy thông tin người dùng thất bại")
	}
	if u == nil {
		return appErrors.NewBadRequest("Email không tồn tại")
	}
	if u.IsVerified {
		return appErrors.NewBadRequest("Email đã được xác thực")
	}

	key := verifyEmailKey(s.redis, u.ID)
	exists, err := s.redis.Exists(key)
	if err != nil {
		return appErrors.NewInternal("Kiểm tra Redis thất bại")
	}
	if exists {
		return appErrors.NewBadRequest("Mã xác thực vẫn còn hiệu lực, không thể gửi lại")
	}

	code := uuid.NewString()
	if err := s.redis.HSet(key,
		"code_hash", sha256Hex(code),
		"attempts", 0,
	); err != nil {
		return appErrors.NewInternal("Lưu mã xác thực thất bại")
	}
	if err := s.redis.Expire(key, 5*time.Minute); err != nil {
		return appErrors.NewInternal("Đặt TTL mã xác thực thất bại")
	}

	verifyURL := s.mailService.BuildVerificationURL(u.Email, code)
	if err := s.mailService.SendVerificationEmail(u.Email, u.FirstName, verifyURL); err != nil {
		return appErrors.NewInternal("Gửi mail thất bại")
	}

	return nil
}

func (s *Service) increaseLoginFail(email, ip string) {
	if email != "" {
		key := loginFailEmailKey(s.redis, email)
		count, err := s.redis.Incr(key)
		if err == nil && count == 1 {
			_ = s.redis.Expire(key, 15*time.Minute)
		}
	}
	if ip != "" {
		key := loginFailIPKey(s.redis, ip)
		count, err := s.redis.Incr(key)
		if err == nil && count == 1 {
			_ = s.redis.Expire(key, 15*time.Minute)
		}
	}
}

func (s *Service) clearLoginFail(email, ip string) {
	if email != "" {
		_ = s.redis.Delete(loginFailEmailKey(s.redis, email))
	}
	if ip != "" {
		_ = s.redis.Delete(loginFailIPKey(s.redis, ip))
	}
}

func (s *Service) ValidateUser(email, password, ip string) (*user.User, error) {
	email = normalizeEmail(email)

	u, err := s.repo.FindUserByEmail(email)
	if err != nil {
		return nil, appErrors.NewInternal("Lấy thông tin người dùng thất bại")
	}
	if u == nil || !u.IsVerified {
		s.increaseLoginFail(email, ip)
		return nil, appErrors.NewBadRequest("Tài khoản không tồn tại hoặc chưa được xác thực")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		s.increaseLoginFail(email, ip)
		return nil, appErrors.NewBadRequest("Sai mật khẩu")
	}

	s.clearLoginFail(email, ip)
	return u, nil
}

func (s *Service) Login(u *user.User, device, ip string) (*LoginResponse, string, error) {
	accessToken, err := s.tokenService.CreateAccessToken(u.ID, u.Email, string(u.Role))
	if err != nil {
		return nil, "", appErrors.NewInternal("Tạo access token thất bại")
	}

	refreshToken, err := s.tokenService.CreateRefreshToken(u.ID, u.Email)
	if err != nil {
		return nil, "", appErrors.NewInternal("Tạo refresh token thất bại")
	}

	rt := &token.RefreshToken{
		TokenHash: sha256Hex(refreshToken),
		UserID:    u.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	if device != "" {
		rt.Device = &device
	}
	if ip != "" {
		rt.IP = &ip
	}

	if err := s.repo.CreateRefreshToken(rt); err != nil {
		return nil, "", appErrors.NewInternal("Lưu refresh token thất bại")
	}

	return &LoginResponse{
		AccessToken: accessToken,
		User: LoginUserResponse{
			ID:        u.ID,
			Email:     u.Email,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Role:      string(u.Role),
		},
	}, refreshToken, nil
}

func (s *Service) Logout(userID uint, refreshToken, accessJTI string, accessTTL time.Duration) error {
	if refreshToken != "" {
		tokens, err := s.repo.FindRefreshTokensByUserID(userID)
		if err != nil {
			return appErrors.NewInternal("Lấy refresh token thất bại")
		}

		targetHash := sha256Hex(refreshToken)
		for _, t := range tokens {
			if t.TokenHash == targetHash {
				if err := s.repo.DeleteRefreshTokenByID(t.ID); err != nil {
					return appErrors.NewInternal("Đăng xuất thất bại")
				}
				break
			}
		}
	}

	if accessJTI != "" && accessTTL > 0 {
		_ = s.redis.Set(revokedAccessKey(s.redis, accessJTI), "1", accessTTL)
	}

	return nil
}

func (s *Service) Refresh(refreshToken string) (*LoginResponse, error) {
	payload, err := s.tokenService.VerifyRefreshToken(refreshToken)
	if err != nil {
		return nil, appErrors.NewUnauthorized("Invalid or expired refresh token")
	}

	u, err := s.repo.FindUserByEmail(payload.Email)
	if err != nil {
		return nil, appErrors.NewInternal("Lấy thông tin người dùng thất bại")
	}
	if u == nil {
		return nil, appErrors.NewUnauthorized("User not found")
	}

	tokens, err := s.repo.FindRefreshTokensByUserID(u.ID)
	if err != nil {
		return nil, appErrors.NewInternal("Lấy refresh token thất bại")
	}

	targetHash := sha256Hex(refreshToken)
	found := false
	for _, t := range tokens {
		if t.TokenHash == targetHash {
			if time.Now().After(t.ExpiresAt) {
				_ = s.repo.DeleteRefreshTokenByID(t.ID)
				return nil, appErrors.NewUnauthorized("Refresh token has expired")
			}
			found = true
			break
		}
	}
	if !found {
		return nil, appErrors.NewUnauthorized("Invalid or expired refresh token")
	}

	accessToken, err := s.tokenService.CreateAccessToken(u.ID, u.Email, string(u.Role))
	if err != nil {
		return nil, appErrors.NewInternal("Tạo access token thất bại")
	}

	return &LoginResponse{
		AccessToken: accessToken,
		User: LoginUserResponse{
			ID:        u.ID,
			Email:     u.Email,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Role:      string(u.Role),
		},
	}, nil
}

func (s *Service) SendResetPasswordEmail(req EmailRequest) error {
	req.Email = normalizeEmail(req.Email)

	u, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return appErrors.NewInternal("Lấy thông tin người dùng thất bại")
	}
	if u == nil {
		return appErrors.NewBadRequest("Email không tồn tại")
	}

	key := resetPasswordKey(s.redis, u.ID)
	exists, err := s.redis.Exists(key)
	if err != nil {
		return appErrors.NewInternal("Kiểm tra Redis thất bại")
	}
	if exists {
		return appErrors.NewBadRequest("Mã đặt lại mật khẩu vẫn còn hiệu lực, không thể gửi lại")
	}

	code := uuid.NewString()
	if err := s.redis.HSet(key,
		"code_hash", sha256Hex(code),
		"attempts", 0,
	); err != nil {
		return appErrors.NewInternal("Lưu mã đặt lại mật khẩu thất bại")
	}
	if err := s.redis.Expire(key, 5*time.Minute); err != nil {
		return appErrors.NewInternal("Đặt TTL mã đặt lại mật khẩu thất bại")
	}

	fullName := fmt.Sprintf("%s %s", u.FirstName, u.LastName)
	if err := s.mailService.SendPasswordResetEmail(u.Email, fullName, code); err != nil {
		return appErrors.NewInternal("Gửi mail thất bại")
	}

	return nil
}

func (s *Service) ResetPassword(req ResetPasswordRequest) error {
	if req.NewPassword != req.ConfirmPassword {
		return appErrors.NewBadRequest("Mật khẩu mới và xác nhận mật khẩu không khớp!")
	}

	req.Email = normalizeEmail(req.Email)

	u, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return appErrors.NewInternal("Lấy thông tin người dùng thất bại")
	}
	if u == nil {
		return appErrors.NewBadRequest("Email không tồn tại")
	}

	key := resetPasswordKey(s.redis, u.ID)
	data, err := s.redis.HGetAll(key)
	if err != nil {
		return appErrors.NewInternal("Lấy mã đặt lại mật khẩu thất bại")
	}
	if len(data) == 0 || data["code_hash"] != sha256Hex(req.Code) {
		_, _ = s.redis.HIncrBy(key, "attempts", 1)
		return appErrors.NewBadRequest("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return appErrors.NewInternal("Mã hóa mật khẩu thất bại")
	}

	if err := s.repo.UpdateUserPassword(u.ID, string(hashedPassword)); err != nil {
		return appErrors.NewInternal("Đặt lại mật khẩu thất bại")
	}

	_ = s.redis.Delete(key)
	return nil
}
