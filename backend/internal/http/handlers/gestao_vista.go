package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/httpx"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/middleware"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type GestaoVistaHandler struct {
	gestao *service.GestaoVistaService
}

func NewGestaoVistaHandler(gestao *service.GestaoVistaService) *GestaoVistaHandler {
	return &GestaoVistaHandler{gestao: gestao}
}

func (h *GestaoVistaHandler) Get(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	unidadeID := chi.URLParam(r, "unidadeId")
	row, err := h.gestao.GetByUnidadeID(r.Context(), user, unidadeID)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, row)
}

type gestaoVistaPutBody struct {
	Snapshot map[string]any `json:"snapshot"`
}

func (h *GestaoVistaHandler) Put(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	unidadeID := chi.URLParam(r, "unidadeId")
	var body gestaoVistaPutBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httpx.WriteError(w, domain.NewDomainError(domain.ErrInvalidRequest, "json invalido"))
		return
	}
	row, err := h.gestao.Upsert(r.Context(), user, unidadeID, body.Snapshot)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, row)
}
