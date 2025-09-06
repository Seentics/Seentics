package middlewares

import (
	"net/http"

	"github.com/seentics/seentics/services/gateway/cache"
	"github.com/seentics/seentics/services/gateway/utils"
)

// Auth middleware with 3 request types
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		routeType := utils.GetRouteType(r.URL.Path)

		switch routeType {
		case "unprotected":
			// No validation needed

		case "public":
			// Validate domain/siteId for public website requests
			if err := utils.ValidatePublicRequest(w, r, cache.ValidateWebsite, WebsiteContextKey); err != nil {
				http.Error(w, err.Error(), http.StatusForbidden)
				return
			}

		case "protected":
			// Validate JWT token and website ownership for dashboard
			if err := utils.ValidateProtectedRequest(w, r, cache.ValidateJWTToken, UserContextKey); err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}
