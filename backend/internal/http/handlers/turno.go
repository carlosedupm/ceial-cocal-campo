package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/httpx"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/middleware"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/repository"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type TurnoHandler struct {
	turnos *service.TurnoService
	users  *repository.UserRepository
}

func NewTurnoHandler(turnos *service.TurnoService, users *repository.UserRepository) *TurnoHandler {
	return &TurnoHandler{turnos: turnos, users: users}
}

type abrirTurnoRequest struct {
	ID        string `json:"id"`
	UnidadeID string `json:"unidade_id"`
	FrenteID  string `json:"frente_id"`
	DeviceID  string `json:"device_id"`
	Inicio    string `json:"inicio"`
}

func (h *TurnoHandler) Abrir(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	var req abrirTurnoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteError(w, domain.NewDomainError(domain.ErrInvalidRequest, "json invalido"))
		return
	}
	turno, err := h.turnos.Abrir(r.Context(), user, service.AbrirTurnoInput{
		TurnoID:   req.ID,
		UnidadeID: req.UnidadeID,
		FrenteID:  req.FrenteID,
		DeviceID:  req.DeviceID,
		Inicio:    req.Inicio,
	})
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, turno)
}

func (h *TurnoHandler) Atual(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	turno, err := h.turnos.Atual(r.Context(), user.ID)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, turno)
}

func (h *TurnoHandler) Fechar(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	id := chi.URLParam(r, "id")
	turno, err := h.turnos.Fechar(r.Context(), user, id)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, turno)
}

func (h *TurnoHandler) ListUnidades(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	list, err := h.users.ListUnidades(r.Context(), user.UnidadeIDs)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	if list == nil {
		list = []domain.Unidade{}
	}
	httpx.WriteJSON(w, http.StatusOK, list)
}

func (h *TurnoHandler) ListFrentes(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	unidadeID := chi.URLParam(r, "unidadeId")
	list, err := h.users.ListFrentes(r.Context(), unidadeID, user.FrenteIDs)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	if list == nil {
		list = []domain.Frente{}
	}
	httpx.WriteJSON(w, http.StatusOK, list)
}
