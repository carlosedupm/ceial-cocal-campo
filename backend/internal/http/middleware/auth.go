package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/httpx"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/service"
)

type ctxKey string

const UserContextKey ctxKey = "user"

func Auth(auth *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				httpx.WriteError(w, domain.NewDomainError(domain.ErrUnauthorized, "token ausente"))
				return
			}
			token := strings.TrimPrefix(header, "Bearer ")
			user, err := auth.ParseAccessToken(token)
			if err != nil {
				httpx.WriteError(w, err)
				return
			}
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserFromContext(ctx context.Context) *domain.Usuario {
	user, _ := ctx.Value(UserContextKey).(*domain.Usuario)
	return user
}
