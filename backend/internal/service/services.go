package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/config"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	cfg  config.Config
	users *repository.UserRepository
}

func NewAuthService(cfg config.Config, users *repository.UserRepository) *AuthService {
	return &AuthService{cfg: cfg, users: users}
}

type claims struct {
	UserID string `json:"uid"`
	Perfil string `json:"perfil"`
	Area   string `json:"area"`
	jwt.RegisteredClaims
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*domain.TokenPair, error) {
	user, hash, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) != nil {
		return nil, domain.NewDomainError(domain.ErrUnauthorized, "credenciais invalidas")
	}
	return s.issueTokens(ctx, user)
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*domain.TokenPair, error) {
	hash := hashToken(refreshToken)
	userID, revoked, err := s.users.FindRefreshToken(ctx, hash)
	if err != nil {
		return nil, err
	}
	if userID == "" || revoked {
		return nil, domain.NewDomainError(domain.ErrUnauthorized, "refresh token invalido")
	}
	user, err := s.users.FindByID(ctx, userID)
	if err != nil || user == nil {
		return nil, domain.NewDomainError(domain.ErrUnauthorized, "usuario nao encontrado")
	}
	_ = s.users.RevokeRefreshToken(ctx, hash)
	return s.issueTokens(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	return s.users.RevokeRefreshToken(ctx, hashToken(refreshToken))
}

func (s *AuthService) ParseAccessToken(token string) (*domain.Usuario, error) {
	parsed, err := jwt.ParseWithClaims(token, &claims{}, func(t *jwt.Token) (any, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, domain.NewDomainError(domain.ErrUnauthorized, "token invalido")
	}
	c, ok := parsed.Claims.(*claims)
	if !ok || !parsed.Valid {
		return nil, domain.NewDomainError(domain.ErrUnauthorized, "token invalido")
	}
	user, err := s.users.FindByID(context.Background(), c.UserID)
	if err != nil || user == nil {
		return nil, domain.NewDomainError(domain.ErrUnauthorized, "usuario nao encontrado")
	}
	return user, nil
}

func (s *AuthService) issueTokens(ctx context.Context, user *domain.Usuario) (*domain.TokenPair, error) {
	now := time.Now()
	accessClaims := &claims{
		UserID: user.ID,
		Perfil: user.Perfil,
		Area:   user.Area,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.AccessTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   user.ID,
		},
	}
	access, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}
	refresh := uuid.NewString()
	expiresAt := now.Add(s.cfg.RefreshTTL).Format(time.RFC3339)
	if err := s.users.SaveRefreshToken(ctx, user.ID, hashToken(refresh), expiresAt); err != nil {
		return nil, err
	}
	return &domain.TokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresIn:    int(s.cfg.AccessTTL.Seconds()),
		Usuario:      *user,
	}, nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

type TurnoService struct {
	turnos    *repository.TurnoRepository
	registros *repository.RegistroRepository
	users     *repository.UserRepository
}

func NewTurnoService(turnos *repository.TurnoRepository, registros *repository.RegistroRepository, users *repository.UserRepository) *TurnoService {
	return &TurnoService{turnos: turnos, registros: registros, users: users}
}

type AbrirTurnoInput struct {
	TurnoID   string
	UnidadeID string
	FrenteID  string
	DeviceID  string
	Inicio    string
}

func (s *TurnoService) Abrir(ctx context.Context, user *domain.Usuario, in AbrirTurnoInput) (*domain.Turno, error) {
	if !contains(user.UnidadeIDs, in.UnidadeID) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "unidade nao autorizada")
	}
	if !contains(user.FrenteIDs, in.FrenteID) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "frente nao autorizada")
	}
	if in.TurnoID != "" {
		existing, err := s.turnos.GetByID(ctx, in.TurnoID)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			if existing.UsuarioID != user.ID {
				return nil, domain.NewDomainError(domain.ErrAcesso001, "turno de outro usuario")
			}
			return existing, nil
		}
	}

	open, err := s.turnos.GetOpenByUser(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	if open != nil {
		return nil, domain.NewDomainError(domain.ErrTurno002, "usuario ja possui turno aberto")
	}
	inicio := in.Inicio
	if inicio == "" {
		inicio = time.Now().UTC().Format(time.RFC3339)
	}
	turnoID := in.TurnoID
	if turnoID == "" {
		turnoID = uuid.NewString()
	}
	t := &domain.Turno{
		ID:        turnoID,
		UsuarioID: user.ID,
		UnidadeID: in.UnidadeID,
		FrenteID:  in.FrenteID,
		Area:      user.Area,
		Status:    domain.TurnoAberto,
		Inicio:    inicio,
		DeviceID:  &in.DeviceID,
	}
	if err := s.turnos.Create(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *TurnoService) Atual(ctx context.Context, userID string) (*domain.Turno, error) {
	return s.turnos.GetOpenByUser(ctx, userID)
}

func (s *TurnoService) Fechar(ctx context.Context, user *domain.Usuario, turnoID string) (*domain.Turno, error) {
	t, err := s.turnos.GetByID(ctx, turnoID)
	if err != nil {
		return nil, err
	}
	if t == nil || t.UsuarioID != user.ID {
		return nil, domain.NewDomainError(domain.ErrInvalidRequest, "turno nao encontrado")
	}
	if t.Status == domain.TurnoFechado {
		return nil, domain.NewDomainError(domain.ErrTurno003, "turno ja fechado")
	}
	if err := s.validateObrigatoriosFechamento(ctx, t); err != nil {
		return nil, err
	}
	fim := time.Now().UTC().Format(time.RFC3339)
	closed, err := s.turnos.Close(ctx, turnoID, fim)
	if err != nil {
		return nil, err
	}
	if closed == nil {
		return nil, domain.NewDomainError(domain.ErrInvalidRequest, "turno nao encontrado")
	}
	return closed, nil
}

func (s *TurnoService) validateObrigatoriosFechamento(ctx context.Context, t *domain.Turno) error {
	var obrigatorios []string
	switch t.Area {
	case AreaColheita:
		obrigatorios = ObrigatoriosColheitaFechamento
	case AreaTransporte:
		obrigatorios = ObrigatoriosTransporteFechamento
	default:
		return nil
	}
	for _, tipo := range obrigatorios {
		ok, err := s.registros.HasTipoForTurno(ctx, t.ID, tipo)
		if err != nil {
			return err
		}
		if !ok {
			return domain.NewDomainError(domain.ErrINT001, "registro obrigatorio ausente: "+tipo)
		}
	}
	return nil
}

type SyncService struct {
	turnos    *repository.TurnoRepository
	registros *repository.RegistroRepository
}

func NewSyncService(turnos *repository.TurnoRepository, registros *repository.RegistroRepository) *SyncService {
	return &SyncService{turnos: turnos, registros: registros}
}

func (s *SyncService) Push(ctx context.Context, user *domain.Usuario, item domain.SyncPushItem) (*domain.Registro, error) {
	eventoAt, err := time.Parse(time.RFC3339, item.EventoAt)
	if err != nil {
		return nil, domain.NewDomainError(domain.ErrInvalidRequest, "evento_at invalido")
	}
	// TMP-001: evento nao pode ser futuro
	if eventoAt.After(time.Now().UTC().Add(2 * time.Minute)) {
		return nil, domain.NewDomainError(domain.ErrTMP001, "evento com timestamp futuro")
	}

	turno, err := s.turnos.GetByID(ctx, item.TurnoID)
	if err != nil {
		return nil, err
	}
	if turno == nil || turno.UsuarioID != user.ID {
		return nil, domain.NewDomainError(domain.ErrTMP002, "turno invalido para usuario")
	}
	// TMP-002 / BR-TURNO-001
	if turno.Status != domain.TurnoAberto {
		return nil, domain.NewDomainError(domain.ErrTurno003, "turno fechado")
	}
	if err := ValidateColheitaRegistro(user, item.Tipo, item.Payload); err != nil {
		return nil, err
	}
	if err := ValidateTransporteRegistro(user, item.Tipo, item.Payload); err != nil {
		return nil, err
	}

	payloadHash, err := hashPayload(item.Payload)
	if err != nil {
		return nil, err
	}

	existing, err := s.registros.FindByIdempotencyKey(ctx, item.IdempotencyKey)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		existingHash, err := s.registros.GetPayloadHash(ctx, item.IdempotencyKey)
		if err != nil {
			return nil, err
		}
		if existingHash != payloadHash {
			return nil, domain.NewDomainError(domain.ErrSyncConflict, "conflito de sync first-sync-wins")
		}
		return existing, nil
	}

	reg := &domain.Registro{
		ID:             item.ID,
		TurnoID:        item.TurnoID,
		Tipo:           item.Tipo,
		IdempotencyKey: item.IdempotencyKey,
		Payload:        item.Payload,
		DeviceID:       item.DeviceID,
		EventoAt:       item.EventoAt,
	}
	if reg.ID == "" {
		reg.ID = uuid.NewString()
	}
	if err := s.registros.Create(ctx, reg, payloadHash, user.ID); err != nil {
		if recovered, recErr := s.recoverDuplicateRegistro(ctx, item, payloadHash, err); recErr != nil {
			return nil, recErr
		} else if recovered != nil {
			return recovered, nil
		}
		return nil, err
	}
	return reg, nil
}

// recoverDuplicateRegistro trata retry após insert bem-sucedido com resposta perdida (idempotência).
func (s *SyncService) recoverDuplicateRegistro(
	ctx context.Context,
	item domain.SyncPushItem,
	payloadHash string,
	insertErr error,
) (*domain.Registro, error) {
	if !repository.IsUniqueViolation(insertErr) {
		return nil, nil
	}
	existing, err := s.registros.FindByIdempotencyKey(ctx, item.IdempotencyKey)
	if err != nil {
		return nil, err
	}
	if existing == nil && item.ID != "" {
		existing, err = s.registros.FindByID(ctx, item.ID)
		if err != nil {
			return nil, err
		}
	}
	if existing == nil {
		return nil, nil
	}
	existingHash, err := s.registros.GetPayloadHash(ctx, existing.IdempotencyKey)
	if err != nil {
		return nil, err
	}
	if existingHash != payloadHash {
		return nil, domain.NewDomainError(domain.ErrSyncConflict, "conflito de sync first-sync-wins")
	}
	return existing, nil
}

func hashPayload(payload map[string]any) (string, error) {
	b, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:]), nil
}

func contains(list []string, id string) bool {
	for _, v := range list {
		if v == id {
			return true
		}
	}
	return false
}

func BuildIdempotencyKey(turnoID, tipo, identificador string) string {
	return fmt.Sprintf("%s:%s:%s", turnoID, tipo, identificador)
}
