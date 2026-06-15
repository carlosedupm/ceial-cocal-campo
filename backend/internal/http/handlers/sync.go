package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/httpx"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/middleware"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/service"
)

type SyncHandler struct {
	sync *service.SyncService
}

func NewSyncHandler(sync *service.SyncService) *SyncHandler {
	return &SyncHandler{sync: sync}
}

type pushRequest struct {
	Items []domain.SyncPushItem `json:"items"`
}

type pushResponse struct {
	Results []domain.Registro `json:"results"`
}

func (h *SyncHandler) Push(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	var req pushRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteError(w, domain.NewDomainError(domain.ErrInvalidRequest, "json invalido"))
		return
	}
	if len(req.Items) == 0 {
		httpx.WriteError(w, domain.NewDomainError(domain.ErrInvalidRequest, "items vazio"))
		return
	}
	results := make([]domain.Registro, 0, len(req.Items))
	for _, item := range req.Items {
		reg, err := h.sync.Push(r.Context(), user, item)
		if err != nil {
			httpx.WriteError(w, err)
			return
		}
		results = append(results, *reg)
	}
	httpx.WriteJSON(w, http.StatusOK, pushResponse{Results: results})
}
