package service

import (
	"context"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/repository"
)

const (
	DisponibilidadeDisponivel       = "disponivel"
	DisponibilidadeEmProcessamento  = "em_processamento"
	DisponibilidadeIndisponivel     = "indisponivel"
	payloadKeyDisponibilidade       = "_disponibilidade"
)

type IndicadoresService struct {
	turnos      *repository.TurnoRepository
	registros   *repository.RegistroRepository
	indicadores *repository.IndicadoresRepository
	users       *repository.UserRepository
}

func NewIndicadoresService(
	turnos *repository.TurnoRepository,
	registros *repository.RegistroRepository,
	indicadores *repository.IndicadoresRepository,
	users *repository.UserRepository,
) *IndicadoresService {
	return &IndicadoresService{
		turnos: turnos, registros: registros, indicadores: indicadores, users: users,
	}
}

func (s *IndicadoresService) MaterializeFromRegistros(ctx context.Context, turnoID string) (*domain.IndicadoresTurno, error) {
	turno, err := s.turnos.GetByID(ctx, turnoID)
	if err != nil || turno == nil {
		return nil, err
	}
	regs, err := s.registros.ListByTurnoID(ctx, turnoID)
	if err != nil {
		return nil, err
	}
	snapshot := buildSnapshotFromRegistros(regs)
	origem := origemIndicadoresFromRegistros(regs)
	row := &domain.IndicadoresTurno{
		TurnoID:   turno.ID,
		UsuarioID: turno.UsuarioID,
		FrenteID:  turno.FrenteID,
		UnidadeID: turno.UnidadeID,
		Area:      turno.Area,
		Snapshot:  snapshot,
		Origem:    origem,
	}
	if err := s.indicadores.Upsert(ctx, row); err != nil {
		return nil, err
	}
	return row, nil
}

// origemIndicadoresFromRegistros — indicadores_turno aceita apenas simulador|central (BR-INTEG-002).
// Registros de fundação (origem campo) não devem definir a origem do snapshot.
func origemIndicadoresFromRegistros(regs []domain.Registro) string {
	hasSimulador := false
	for _, reg := range regs {
		switch reg.Origem {
		case "central":
			return "central"
		case "simulador":
			hasSimulador = true
		}
	}
	if hasSimulador {
		return "simulador"
	}
	return "simulador"
}

func buildSnapshotFromRegistros(regs []domain.Registro) map[string]any {
	performance := map[string]any{}
	qualidade := map[string]any{}
	metas := map[string]any{}

	for _, reg := range regs {
		item := indicadorFromPayload(reg.Payload)
		switch {
		case IsColheitaTipo(reg.Tipo):
			key := colheitaSnapshotKey(reg.Tipo)
			performance[key] = item
		case IsQualidadeTipo(reg.Tipo):
			key := qualidadeSnapshotKey(reg.Tipo)
			qualidade[key] = item
		case reg.Tipo == "meta_planejada":
			if meta, ok := reg.Payload["indicador"].(string); ok {
				metas[meta] = reg.Payload["valor"]
			}
		}
	}

	snapshot := map[string]any{
		"performance": performance,
		"qualidade":   qualidade,
	}
	if len(metas) > 0 {
		snapshot["metas"] = metas
	}
	return snapshot
}

func colheitaSnapshotKey(tipo string) string {
	switch tipo {
	case TipoHorasCorte:
		return "horas_corte"
	case TipoConsumoDensidade:
		return "consumo_densidade"
	case TipoEntradaCana:
		return "entrada_cana"
	default:
		return tipo
	}
}

func qualidadeSnapshotKey(tipo string) string {
	switch tipo {
	case TipoImpurezas:
		return "impurezas"
	case TipoPerdasCampo:
		return "perdas_campo"
	default:
		return tipo
	}
}

func indicadorFromPayload(payload map[string]any) map[string]any {
	disp := DisponibilidadeDisponivel
	if v, ok := payload[payloadKeyDisponibilidade].(string); ok && v != "" {
		disp = v
	}
	valor := map[string]any{}
	for k, v := range payload {
		if k == payloadKeyDisponibilidade {
			continue
		}
		valor[k] = v
	}
	return map[string]any{
		"valor":           valor,
		"disponibilidade": disp,
	}
}

func (s *IndicadoresService) GetAtual(ctx context.Context, user *domain.Usuario) (*domain.IndicadoresTurno, error) {
	turno, err := s.turnos.GetOpenByUser(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	if turno == nil {
		return nil, domain.NewDomainError(domain.ErrInvalidRequest, "nenhum turno aberto")
	}
	return s.GetByTurnoID(ctx, user, turno.ID)
}

func (s *IndicadoresService) GetByTurnoID(ctx context.Context, user *domain.Usuario, turnoID string) (*domain.IndicadoresTurno, error) {
	turno, err := s.turnos.GetByID(ctx, turnoID)
	if err != nil {
		return nil, err
	}
	if turno == nil {
		return nil, domain.NewDomainError(domain.ErrInvalidRequest, "turno nao encontrado")
	}
	if !s.canReadTurno(user, turno) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "acesso negado ao turno")
	}
	row, err := s.indicadores.GetByTurnoID(ctx, turnoID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return &domain.IndicadoresTurno{
			TurnoID:   turno.ID,
			UsuarioID: turno.UsuarioID,
			FrenteID:  turno.FrenteID,
			UnidadeID: turno.UnidadeID,
			Area:      turno.Area,
			Snapshot: map[string]any{
				"performance": map[string]any{},
				"qualidade":   map[string]any{},
			},
			Origem: "simulador",
		}, nil
	}
	return row, nil
}

func (s *IndicadoresService) canReadTurno(user *domain.Usuario, turno *domain.Turno) bool {
	if user.ID == turno.UsuarioID {
		return true
	}
	if IsSimuladorCentral(user) && contains(user.FrenteIDs, turno.FrenteID) {
		return true
	}
	return SupervisorPodeLerFrente(user, turno.FrenteID)
}

func (s *IndicadoresService) ListTurnosAbertosFrente(ctx context.Context, user *domain.Usuario, frenteID string) ([]domain.TurnoComUsuario, error) {
	if !IsSimuladorCentral(user) && !SupervisorPodeLerFrente(user, frenteID) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "frente nao autorizada")
	}
	if !contains(user.FrenteIDs, frenteID) && !IsSimuladorCentral(user) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "frente nao autorizada")
	}
	if IsSimuladorCentral(user) && !contains(user.FrenteIDs, frenteID) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "frente nao autorizada")
	}
	list, err := s.turnos.ListOpenByFrente(ctx, frenteID)
	if err != nil {
		return nil, err
	}
	if list == nil {
		return []domain.TurnoComUsuario{}, nil
	}
	return list, nil
}

type FrenteResumo struct {
	FrenteID   string                    `json:"frente_id"`
	Turnos     []domain.TurnoComUsuario  `json:"turnos"`
	Indicadores []domain.IndicadoresTurno `json:"indicadores"`
}

func (s *IndicadoresService) ResumoFrente(ctx context.Context, user *domain.Usuario, frenteID string) (*FrenteResumo, error) {
	turnos, err := s.ListTurnosAbertosFrente(ctx, user, frenteID)
	if err != nil {
		return nil, err
	}
	inds, err := s.indicadores.ListByFrenteID(ctx, frenteID)
	if err != nil {
		return nil, err
	}
	openIDs := map[string]bool{}
	for _, t := range turnos {
		openIDs[t.ID] = true
	}
	var filtered []domain.IndicadoresTurno
	for _, ind := range inds {
		if openIDs[ind.TurnoID] {
			filtered = append(filtered, ind)
		}
	}
	return &FrenteResumo{
		FrenteID:    frenteID,
		Turnos:      turnos,
		Indicadores: filtered,
	}, nil
}
