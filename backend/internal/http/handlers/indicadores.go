package handlers

import (
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/httpx"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/middleware"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type IndicadoresHandler struct {
	indicadores *service.IndicadoresService
}

func NewIndicadoresHandler(indicadores *service.IndicadoresService) *IndicadoresHandler {
	return &IndicadoresHandler{indicadores: indicadores}
}

func (h *IndicadoresHandler) Atual(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	row, err := h.indicadores.GetAtual(r.Context(), user)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, row)
}

func (h *IndicadoresHandler) PorTurno(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	turnoID := chi.URLParam(r, "id")
	row, err := h.indicadores.GetByTurnoID(r.Context(), user, turnoID)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, row)
}

func (h *IndicadoresHandler) TurnosFrente(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	frenteID := chi.URLParam(r, "id")
	list, err := h.indicadores.ListTurnosAbertosFrente(r.Context(), user, frenteID)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	if list == nil {
		list = []domain.TurnoComUsuario{}
	}
	httpx.WriteJSON(w, http.StatusOK, list)
}

func (h *IndicadoresHandler) ResumoFrente(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	frenteID := chi.URLParam(r, "id")
	resumo, err := h.indicadores.ResumoFrente(r.Context(), user, frenteID)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, resumo)
}
