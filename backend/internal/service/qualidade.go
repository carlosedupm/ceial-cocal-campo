package service

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

// BR-QUALIDADE-* tipos de registro e faixas MVP (BRF-004 seção 5/7).
const (
	TipoImpurezas    = "impurezas"
	TipoPerdasCampo  = "perdas_campo"
	AreaQualidade    = "qualidade"
	ImpurezaMinKgTon = 0.0
	ImpurezaMaxKgTon = 50.0
	PercentualMin    = 0.0
	PercentualMax    = 100.0
	TalhaoCodigoMax  = 20
)

var qualidadeTipos = map[string]bool{
	TipoImpurezas:   true,
	TipoPerdasCampo: true,
}

func IsQualidadeTipo(tipo string) bool {
	return qualidadeTipos[tipo]
}

// TiposQualidadeFechamento — INT-001 para área qualidade (BRF-004): pelo menos um tipo.
var TiposQualidadeFechamento = []string{TipoImpurezas, TipoPerdasCampo}

func ValidateQualidadeRegistro(user *domain.Usuario, tipo string, payload map[string]any) error {
	if !IsQualidadeTipo(tipo) {
		return nil
	}
	if IsSimuladorCentral(user) {
		return ValidateQualidadePayload(tipo, payload)
	}
	if user.Area != AreaQualidade {
		return domain.NewDomainError(domain.ErrAcesso001, "tipo qualidade nao permitido para esta area")
	}
	return ValidateQualidadePayload(tipo, payload)
}

func ValidateQualidadePayload(tipo string, payload map[string]any) error {
	if disp, ok := payload["_disponibilidade"].(string); ok && disp == "em_processamento" {
		if _, err := validateTalhaoCodigo(payload); err != nil {
			return err
		}
		return nil
	}
	if _, err := validateTalhaoCodigo(payload); err != nil {
		return err
	}
	switch tipo {
	case TipoImpurezas:
		return validateImpurezas(payload)
	case TipoPerdasCampo:
		return validatePerdasCampo(payload)
	default:
		return domain.NewDomainError(domain.ErrQualidade001, "tipo qualidade desconhecido")
	}
}

func validateTalhaoCodigo(payload map[string]any) (string, error) {
	codigo, err := payloadString(payload, "talhao_codigo")
	if err != nil {
		return "", domain.NewDomainError(domain.ErrQualidade001, "talhao_codigo invalido")
	}
	codigo = strings.TrimSpace(codigo)
	if len(codigo) < 1 || len(codigo) > TalhaoCodigoMax {
		return "", domain.NewDomainError(domain.ErrQualidade001, "talhao_codigo fora do tamanho permitido")
	}
	for _, r := range codigo {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' || r == '-' {
			continue
		}
		return "", domain.NewDomainError(domain.ErrQualidade001, "talhao_codigo com caracteres invalidos")
	}
	return codigo, nil
}

func validateImpurezas(payload map[string]any) error {
	mineral, err := payloadFloat(payload, "impureza_mineral_kg_ton")
	if err != nil {
		return domain.NewDomainError(domain.ErrQualidade001, "impureza mineral invalida")
	}
	vegetal, err := payloadFloat(payload, "impureza_vegetal_kg_ton")
	if err != nil {
		return domain.NewDomainError(domain.ErrQualidade001, "impureza vegetal invalida")
	}
	if mineral < ImpurezaMinKgTon || mineral > ImpurezaMaxKgTon {
		return domain.NewDomainError(domain.ErrQualidade001, fmt.Sprintf("impureza mineral fora da faixa %.0f-%.0f kg/ton", ImpurezaMinKgTon, ImpurezaMaxKgTon))
	}
	if vegetal < ImpurezaMinKgTon || vegetal > ImpurezaMaxKgTon {
		return domain.NewDomainError(domain.ErrQualidade001, fmt.Sprintf("impureza vegetal fora da faixa %.0f-%.0f kg/ton", ImpurezaMinKgTon, ImpurezaMaxKgTon))
	}
	if mineral <= 0 && vegetal <= 0 {
		return domain.NewDomainError(domain.ErrQualidade001, "informe ao menos uma impureza maior que zero")
	}
	return nil
}

func validatePerdasCampo(payload map[string]any) error {
	perdas, err := payloadFloat(payload, "perdas_pct")
	if err != nil {
		return domain.NewDomainError(domain.ErrQualidade001, "perdas invalidas")
	}
	pisoteio, err := payloadFloat(payload, "pisoteio_pct")
	if err != nil {
		return domain.NewDomainError(domain.ErrQualidade001, "pisoteio invalido")
	}
	abalo, err := payloadFloat(payload, "abalo_arranquio_pct")
	if err != nil {
		return domain.NewDomainError(domain.ErrQualidade001, "abalo e arranquio invalido")
	}
	for name, val := range map[string]float64{
		"perdas": perdas, "pisoteio": pisoteio, "abalo": abalo,
	} {
		if val < PercentualMin || val > PercentualMax {
			return domain.NewDomainError(domain.ErrQualidade001, fmt.Sprintf("%s fora da faixa 0-100%%", name))
		}
	}
	if perdas <= 0 && pisoteio <= 0 && abalo <= 0 {
		return domain.NewDomainError(domain.ErrQualidade001, "informe ao menos um percentual maior que zero")
	}
	return nil
}

func payloadString(payload map[string]any, key string) (string, error) {
	v, ok := payload[key]
	if !ok {
		return "", fmt.Errorf("missing %s", key)
	}
	s, ok := v.(string)
	if !ok {
		return "", fmt.Errorf("invalid type")
	}
	return s, nil
}
