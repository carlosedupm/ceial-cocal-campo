package httpx

import (
	"encoding/json"
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func WriteJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func WriteError(w http.ResponseWriter, err error) {
	if de, ok := domain.IsDomainError(err); ok {
		status := mapErrorStatus(de.Code)
		WriteJSON(w, status, ErrorResponse{Code: de.Code, Message: de.Message})
		return
	}
	WriteJSON(w, http.StatusInternalServerError, ErrorResponse{
		Code:    "ERR-INTERNAL",
		Message: "erro interno",
	})
}

func mapErrorStatus(code string) int {
	switch code {
	case domain.ErrTurno002, domain.ErrSyncConflict:
		return http.StatusConflict
	case domain.ErrTurno003, domain.ErrAcesso001:
		return http.StatusForbidden
	case domain.ErrTMP001, domain.ErrTMP002, domain.ErrInvalidRequest:
		return http.StatusUnprocessableEntity
	case domain.ErrUnauthorized:
		return http.StatusUnauthorized
	default:
		return http.StatusBadRequest
	}
}
