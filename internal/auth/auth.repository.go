package auth

import (
	"strings"

	"backend/internal/auth/token"
	"backend/internal/modules/user"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindUserByEmail(email string) (*user.User, error) {
	var u user.User

	err := r.db.
		Where("email = ?", strings.TrimSpace(strings.ToLower(email))).
		First(&u).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &u, nil
}

func (r *Repository) CreateUser(u *user.User) error {
	return r.db.Create(u).Error
}

func (r *Repository) UpdateUserVerified(userID uint, verified bool) error {
	return r.db.Model(&user.User{}).
		Where("id = ?", userID).
		Update("is_verified", verified).Error
}

func (r *Repository) UpdateUserPassword(userID uint, hashedPassword string) error {
	return r.db.Model(&user.User{}).
		Where("id = ?", userID).
		Update("password", hashedPassword).Error
}

func (r *Repository) CreateRefreshToken(rt *token.RefreshToken) error {
	return r.db.Create(rt).Error
}

func (r *Repository) FindRefreshTokensByUserID(userID uint) ([]token.RefreshToken, error) {
	var tokens []token.RefreshToken
	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at ASC").
		Find(&tokens).Error
	return tokens, err
}

func (r *Repository) DeleteRefreshTokenByID(id uint) error {
	return r.db.Delete(&token.RefreshToken{}, id).Error
}
