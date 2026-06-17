package service

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/repository"
)

// BR-INTEG-006 / BR-TRANS-005 — definição canônica dos indicadores do painel unidade.
var painelIndicadorDefs = map[string]struct {
	grupo      string
	horizontes []string
	direcoes   []string
}{
	"entrada_cana":       {grupo: "performance", horizontes: []string{"diario", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"densidade":          {grupo: "performance", horizontes: []string{"diario", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"atr":                {grupo: "performance", horizontes: []string{"diario", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"horas_corte":        {grupo: "performance", horizontes: []string{"diario", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"consumo_transbordo": {grupo: "performance", horizontes: []string{"semanal", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"consumo_colhedora":  {grupo: "performance", horizontes: []string{"semanal", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"impureza_mineral":   {grupo: "qualidade", horizontes: []string{"diario", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"impureza_vegetal":   {grupo: "qualidade", horizontes: []string{"diario", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"perdas":             {grupo: "qualidade", horizontes: []string{"semanal", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"pisoteio":           {grupo: "qualidade", horizontes: []string{"semanal", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
	"abalo_arranquio":    {grupo: "qualidade", horizontes: []string{"semanal", "safra"}, direcoes: []string{"maior_melhor", "menor_melhor"}},
}

var painelDisponibilidades = map[string]bool{
	DisponibilidadeDisponivel:      true,
	DisponibilidadeEmProcessamento: true,
	DisponibilidadeIndisponivel:    true,
}

type GestaoVistaService struct {
	painel *repository.PainelUnidadeRepository
}

func NewGestaoVistaService(painel *repository.PainelUnidadeRepository) *GestaoVistaService {
	return &GestaoVistaService{painel: painel}
}

func (s *GestaoVistaService) GetByUnidadeID(
	ctx context.Context,
	user *domain.Usuario,
	unidadeID string,
) (*domain.PainelUnidade, error) {
	if !canReadPainelUnidade(user, unidadeID) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "unidade nao autorizada")
	}
	row, err := s.painel.GetByUnidadeID(ctx, unidadeID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, domain.NewDomainError(domain.ErrNotFound, "painel nao encontrado para a unidade")
	}
	return row, nil
}

func (s *GestaoVistaService) Upsert(
	ctx context.Context,
	user *domain.Usuario,
	unidadeID string,
	snapshot map[string]any,
) (*domain.PainelUnidade, error) {
	if !IsSimuladorCentral(user) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "apenas simulador central pode ingerir painel")
	}
	if !contains(user.UnidadeIDs, unidadeID) {
		return nil, domain.NewDomainError(domain.ErrAcesso001, "unidade nao autorizada")
	}
	if err := ValidatePainelSnapshot(snapshot); err != nil {
		return nil, err
	}
	row := &domain.PainelUnidade{
		UnidadeID:    unidadeID,
		Snapshot:     snapshot,
		Origem:       "simulador",
		IngestidoPor: &user.ID,
	}
	if err := s.painel.Upsert(ctx, row); err != nil {
		return nil, err
	}
	return row, nil
}

func canReadPainelUnidade(user *domain.Usuario, unidadeID string) bool {
	if user == nil {
		return false
	}
	return contains(user.UnidadeIDs, unidadeID)
}

// ValidatePainelSnapshot — BR-INTEG-006 estrutura mínima do snapshot Gestão à Vista.
func ValidatePainelSnapshot(snapshot map[string]any) error {
	if snapshot == nil {
		return domain.NewDomainError(domain.ErrInvalidRequest, "snapshot obrigatorio")
	}
	seg, ok := snapshot["seguranca"].(map[string]any)
	if !ok {
		return domain.NewDomainError(domain.ErrInvalidRequest, "seguranca obrigatoria")
	}
	contadores, ok := seg["dias_sem_acidentes"].([]any)
	if !ok || len(contadores) == 0 {
		return domain.NewDomainError(domain.ErrInvalidRequest, "dias_sem_acidentes obrigatorio")
	}
	for i, raw := range contadores {
		item, ok := raw.(map[string]any)
		if !ok {
			return domain.NewDomainError(domain.ErrInvalidRequest, fmt.Sprintf("contador %d invalido", i))
		}
		tipo, _ := item["tipo"].(string)
		if tipo != "unidade" && tipo != "operacao" {
			return domain.NewDomainError(domain.ErrInvalidRequest, "tipo contador invalido")
		}
		if rotulo, _ := item["rotulo"].(string); rotulo == "" {
			return domain.NewDomainError(domain.ErrInvalidRequest, "rotulo contador obrigatorio")
		}
		dias, err := asNumber(item["dias"])
		if err != nil || dias < 0 {
			return domain.NewDomainError(domain.ErrInvalidRequest, "dias contador invalido")
		}
	}

	for key, def := range painelIndicadorDefs {
		section, ok := snapshot[def.grupo].(map[string]any)
		if !ok {
			return domain.NewDomainError(domain.ErrInvalidRequest, def.grupo+" obrigatorio")
		}
		ind, ok := section[key].(map[string]any)
		if !ok {
			return domain.NewDomainError(domain.ErrInvalidRequest, "indicador "+key+" obrigatorio")
		}
		if err := validateIndicadorPainel(key, ind, def.horizontes, def.direcoes); err != nil {
			return err
		}
	}
	return nil
}

func validateIndicadorPainel(
	key string,
	ind map[string]any,
	horizontesPermitidos []string,
	direcoesPermitidas []string,
) error {
	um, _ := ind["unidade_medida"].(string)
	if um == "" {
		return domain.NewDomainError(domain.ErrInvalidRequest, key+": unidade_medida obrigatoria")
	}
	direcao, _ := ind["direcao"].(string)
	if !containsStr(direcoesPermitidas, direcao) {
		return domain.NewDomainError(domain.ErrInvalidRequest, key+": direcao invalida")
	}
	horizontes, ok := ind["horizontes"].(map[string]any)
	if !ok {
		return domain.NewDomainError(domain.ErrInvalidRequest, key+": horizontes obrigatorios")
	}
	for _, h := range horizontesPermitidos {
		raw, ok := horizontes[h]
		if !ok {
			return domain.NewDomainError(domain.ErrInvalidRequest, key+": horizonte "+h+" obrigatorio")
		}
		comp, ok := raw.(map[string]any)
		if !ok {
			return domain.NewDomainError(domain.ErrInvalidRequest, key+": comparativo "+h+" invalido")
		}
		if err := validateComparativo(comp); err != nil {
			return domain.NewDomainError(domain.ErrInvalidRequest, key+": "+err.Error())
		}
	}
	for h := range horizontes {
		if !containsStr(horizontesPermitidos, h) {
			return domain.NewDomainError(domain.ErrInvalidRequest, key+": horizonte "+h+" nao permitido")
		}
	}
	return nil
}

func validateComparativo(comp map[string]any) error {
	if disp, ok := comp["disponibilidade"].(string); ok && disp != "" {
		if !painelDisponibilidades[disp] {
			return fmt.Errorf("disponibilidade invalida")
		}
	}
	if _, hasP := comp["planejado"]; !hasP {
		return fmt.Errorf("planejado obrigatorio")
	}
	if _, hasE := comp["executado"]; !hasE {
		return fmt.Errorf("executado obrigatorio")
	}
	return nil
}

func containsStr(list []string, v string) bool {
	for _, s := range list {
		if s == v {
			return true
		}
	}
	return false
}

func asNumber(v any) (float64, error) {
	switch n := v.(type) {
	case float64:
		return n, nil
	case int:
		return float64(n), nil
	case int64:
		return float64(n), nil
	default:
		return math.NaN(), fmt.Errorf("not a number")
	}
}

// ParseComparableNumber — converte planejado/executado numérico ou hora HH:MM para float.
func ParseComparableNumber(v any) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case int:
		return float64(n), true
	case int64:
		return float64(n), true
	case string:
		s := strings.TrimSpace(n)
		if strings.Contains(s, ":") {
			parts := strings.Split(s, ":")
			if len(parts) != 2 {
				return 0, false
			}
			h, err1 := strconv.ParseFloat(parts[0], 64)
			m, err2 := strconv.ParseFloat(parts[1], 64)
			if err1 != nil || err2 != nil {
				return 0, false
			}
			return h*60 + m, true
		}
		f, err := strconv.ParseFloat(strings.ReplaceAll(s, ",", "."), 64)
		return f, err == nil
	default:
		return 0, false
	}
}
