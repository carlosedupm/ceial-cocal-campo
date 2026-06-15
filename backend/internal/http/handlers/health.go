package handlers

import (
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/httpx"
)

func Health(w http.ResponseWriter, _ *http.Request) {
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
