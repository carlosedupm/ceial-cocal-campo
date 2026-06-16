package domain

import "errors"

// Domain error codes mapped to HTTP responses (ADR-001).
const (
	ErrTurno002       = "ERR-TURNO-002"
	ErrTurno003       = "ERR-TURNO-003"
	ErrTMP001         = "ERR-TMP-001"
	ErrTMP002         = "ERR-TMP-002"
	ErrSyncConflict   = "ERR-SYNC-CONFLICT"
	ErrAcesso001      = "ERR-ACESSO-001"
	ErrColheita001    = "ERR-COLHEITA-001"
	ErrTransporte001  = "ERR-TRANSPORTE-001"
	ErrQualidade001   = "ERR-QUALIDADE-001"
	ErrINT001         = "ERR-INT-001"
	ErrUnauthorized   = "ERR-AUTH-001"
	ErrInvalidRequest = "ERR-REQ-001"
)

type DomainError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *DomainError) Error() string {
	return e.Code + ": " + e.Message
}

func NewDomainError(code, message string) *DomainError {
	return &DomainError{Code: code, Message: message}
}

func IsDomainError(err error) (*DomainError, bool) {
	var de *DomainError
	if errors.As(err, &de) {
		return de, true
	}
	return nil, false
}

type TurnoStatus string

const (
	TurnoAberto  TurnoStatus = "aberto"
	TurnoFechado TurnoStatus = "fechado"
)

type Usuario struct {
	ID         string   `json:"id"`
	Email      string   `json:"email"`
	Nome       string   `json:"nome"`
	Perfil     string   `json:"perfil"`
	Area       string   `json:"area"`
	UnidadeIDs []string `json:"unidade_ids"`
	FrenteIDs  []string `json:"frente_ids"`
}

type Turno struct {
	ID        string      `json:"id"`
	UsuarioID string      `json:"usuario_id"`
	UnidadeID string      `json:"unidade_id"`
	FrenteID  string      `json:"frente_id"`
	Area      string      `json:"area"`
	Status    TurnoStatus `json:"status"`
	Inicio    string      `json:"inicio"`
	Fim       *string     `json:"fim,omitempty"`
	DeviceID  *string     `json:"device_id,omitempty"`
}

type Registro struct {
	ID             string         `json:"id"`
	TurnoID        string         `json:"turno_id"`
	Tipo           string         `json:"tipo"`
	IdempotencyKey string         `json:"idempotency_key"`
	Payload        map[string]any `json:"payload"`
	DeviceID       string         `json:"device_id"`
	EventoAt       string         `json:"evento_at"`
	SyncedAt       string         `json:"synced_at"`
}

type SyncPushItem struct {
	ID             string         `json:"id"`
	TurnoID        string         `json:"turno_id"`
	Tipo           string         `json:"tipo"`
	IdempotencyKey string         `json:"idempotency_key"`
	Payload        map[string]any `json:"payload"`
	DeviceID       string         `json:"device_id"`
	EventoAt       string         `json:"evento_at"`
}

type Unidade struct {
	ID   string `json:"id"`
	Nome string `json:"nome"`
}

type Frente struct {
	ID        string `json:"id"`
	UnidadeID string `json:"unidade_id"`
	Nome      string `json:"nome"`
}

type TokenPair struct {
	AccessToken  string  `json:"access_token"`
	RefreshToken string  `json:"refresh_token"`
	ExpiresIn    int     `json:"expires_in"`
	Usuario      Usuario `json:"usuario"`
}
