package middlewares

import (
	"net/http"
)

// Context keys
type contextKey string

const (
	UserContextKey    contextKey = "user"
	WebsiteContextKey contextKey = "website"
)

// applyMiddleware applies multiple middleware functions
func ApplyMiddleware(handler http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}
