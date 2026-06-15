package config

import (
	"os"
	"time"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
	CORSOrigin  string
	AccessTTL   time.Duration
	RefreshTTL  time.Duration
}

func Load() Config {
	return Config{
		DatabaseURL: getenv("DATABASE_URL", "postgres://cocal:cocal@localhost:5432/cocal_campo?sslmode=disable"),
		JWTSecret:   getenv("JWT_SECRET", "dev-secret-change-in-prod"),
		Port:        getenv("PORT", "8080"),
		CORSOrigin:  getenv("CORS_ORIGIN", "http://localhost:5173"),
		AccessTTL:   30 * time.Minute,
		RefreshTTL:  7 * 24 * time.Hour, // BR-ACESSO-004
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
