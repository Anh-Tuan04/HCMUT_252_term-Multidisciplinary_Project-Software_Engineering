package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort          string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPass           string
	DBName           string
	RedisAddr        string
	RedisPassword    string
	JWTAccessSecret  string
	JWTRefreshSecret string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		AppPort:          os.Getenv("APP_PORT"),
		DBHost:           os.Getenv("DB_HOST"),
		DBPort:           os.Getenv("DB_PORT"),
		DBUser:           os.Getenv("DB_USER"),
		DBPass:           os.Getenv("DB_PASS"),
		DBName:           os.Getenv("DB_NAME"),
		RedisAddr:        os.Getenv("REDIS_ADDR"),
		RedisPassword:    os.Getenv("REDIS_PASSWORD"),
		JWTAccessSecret:  os.Getenv("JWT_ACCESS_SECRET"),
		JWTRefreshSecret: os.Getenv("JWT_REFRESH_SECRET"),
	}

	if cfg.AppPort == "" {
		log.Fatal("APP_PORT is required")
	}

	return cfg
}
