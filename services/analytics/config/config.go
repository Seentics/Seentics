package config

import (
	"errors"
	"os"
	"strconv"
)

type Config struct {
	Environment string
	Port        string
	DatabaseURL string
	LogLevel    string
	JWTSecret   string
}

func Load() (*Config, error) {
	// Load .env file if it exists (disabled for Docker)
	// _ = godotenv.Load()

	cfg := &Config{
		Environment: getEnvOrDefault("ENVIRONMENT", "development"),
		Port:        getEnvOrDefault("PORT", "3002"),
		DatabaseURL: getEnvOrDefault("DATABASE_URL", ""),
		LogLevel:    getEnvOrDefault("LOG_LEVEL", "info"),
		JWTSecret:   getEnvOrDefault("JWT_SECRET", ""),
	}

	// Validate required fields for production
	if cfg.Environment == "production" {
		if cfg.DatabaseURL == "" {
			return nil, errors.New("DATABASE_URL is required in production")
		}
		if cfg.JWTSecret == "" {
			return nil, errors.New("JWT_SECRET is required in production")
		}
		if cfg.JWTSecret == "your-secret-key" {
			return nil, errors.New("JWT_SECRET cannot be the default value in production")
		}
	}

	return cfg, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func GetEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func GetEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}
