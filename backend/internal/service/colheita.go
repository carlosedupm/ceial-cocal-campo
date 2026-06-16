package service

import (
	"fmt"
	"math"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

// BR-COLHEITA-* tipos de registro e faixas MVP (BRF-002 seção 5).
const (
	TipoHorasCorte        = "horas_corte"
	TipoConsumoDensidade  = "consumo_densidade"
	TipoEntradaCana       = "entrada_cana"
	IdempotencyUnico      = "unico"
	AreaColheita          = "colheita"
	ConsumoMinLT          = 0.5
	ConsumoMaxLT          = 15.0
	DensidadeMinTonCarga  = 20.0
	DensidadeMaxTonCarga  = 35.0
	EntradaCanaMaxTon     = 5000.0
)

var colheitaTipos = map[string]bool{
	TipoHorasCorte:       true,
	TipoConsumoDensidade: true,
	TipoEntradaCana:      true,
}

func IsColheitaTipo(tipo string) bool {
	return colheitaTipos[tipo]
}

// ObrigatoriosColheitaFechamento — INT-001 para área colheita (BRF-002).
var ObrigatoriosColheitaFechamento = []string{TipoHorasCorte}

func ValidateColheitaRegistro(user *domain.Usuario, tipo string, payload map[string]any) error {
	if !IsColheitaTipo(tipo) {
		return nil
	}
	if IsSimuladorCentral(user) {
		return ValidateColheitaPayload(tipo, payload)
	}
	if user.Area != AreaColheita {
		return domain.NewDomainError(domain.ErrAcesso001, "tipo colheita nao permitido para esta area")
	}
	return ValidateColheitaPayload(tipo, payload)
}

func ValidateColheitaPayload(tipo string, payload map[string]any) error {
	switch tipo {
	case TipoHorasCorte:
		return validateHorasCorte(payload)
	case TipoConsumoDensidade:
		return validateConsumoDensidade(payload)
	case TipoEntradaCana:
		return validateEntradaCana(payload)
	default:
		return domain.NewDomainError(domain.ErrColheita001, "tipo colheita desconhecido")
	}
}

func validateHorasCorte(payload map[string]any) error {
	horas, err := payloadInt(payload, "horas")
	if err != nil {
		return domain.NewDomainError(domain.ErrColheita001, "horas invalidas")
	}
	minutos, err := payloadInt(payload, "minutos")
	if err != nil {
		return domain.NewDomainError(domain.ErrColheita001, "minutos invalidos")
	}
	if horas < 0 || horas > 24 || minutos < 0 || minutos > 59 {
		return domain.NewDomainError(domain.ErrColheita001, "horas de corte fora da faixa")
	}
	if horas == 0 && minutos == 0 {
		return domain.NewDomainError(domain.ErrColheita001, "horas de corte deve ser maior que zero")
	}
	return nil
}

func validateConsumoDensidade(payload map[string]any) error {
	consumo, err := payloadFloat(payload, "consumo_lt")
	if err != nil {
		return domain.NewDomainError(domain.ErrColheita001, "consumo invalido")
	}
	densidade, err := payloadFloat(payload, "densidade_ton_carga")
	if err != nil {
		return domain.NewDomainError(domain.ErrColheita001, "densidade invalida")
	}
	if consumo < ConsumoMinLT || consumo > ConsumoMaxLT {
		return domain.NewDomainError(domain.ErrColheita001, fmt.Sprintf("consumo fora da faixa %.1f-%.1f L/t", ConsumoMinLT, ConsumoMaxLT))
	}
	if densidade < DensidadeMinTonCarga || densidade > DensidadeMaxTonCarga {
		return domain.NewDomainError(domain.ErrColheita001, fmt.Sprintf("densidade fora da faixa %.0f-%.0f ton/carga", DensidadeMinTonCarga, DensidadeMaxTonCarga))
	}
	return nil
}

func validateEntradaCana(payload map[string]any) error {
	ton, err := payloadFloat(payload, "toneladas")
	if err != nil {
		return domain.NewDomainError(domain.ErrColheita001, "toneladas invalidas")
	}
	if ton <= 0 || ton > EntradaCanaMaxTon {
		return domain.NewDomainError(domain.ErrColheita001, "toneladas fora da faixa permitida")
	}
	return nil
}

func payloadInt(payload map[string]any, key string) (int, error) {
	v, ok := payload[key]
	if !ok {
		return 0, fmt.Errorf("missing %s", key)
	}
	switch n := v.(type) {
	case float64:
		if math.Mod(n, 1) != 0 {
			return 0, fmt.Errorf("not int")
		}
		return int(n), nil
	case int:
		return n, nil
	case int64:
		return int(n), nil
	default:
		return 0, fmt.Errorf("invalid type")
	}
}

func payloadFloat(payload map[string]any, key string) (float64, error) {
	v, ok := payload[key]
	if !ok {
		return 0, fmt.Errorf("missing %s", key)
	}
	switch n := v.(type) {
	case float64:
		return n, nil
	case int:
		return float64(n), nil
	case int64:
		return float64(n), nil
	default:
		return 0, fmt.Errorf("invalid type")
	}
}
