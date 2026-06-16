package service

import (
	"fmt"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

// BR-TRANSPORTE-* tipos de registro e faixas MVP (BRF-003 seção 5/7).
const (
	TipoConsumoTransbordo = "consumo_transbordo"
	TipoCargasViagens      = "cargas_viagens"
	AreaTransporte          = "transporte"
	ConsumoTransbordoMinLT  = 1.0
	ConsumoTransbordoMaxLT  = 30.0
	CargasViagensMaxTon     = 5000.0
)

var transporteTipos = map[string]bool{
	TipoConsumoTransbordo: true,
	TipoCargasViagens:     true,
}

func IsTransporteTipo(tipo string) bool {
	return transporteTipos[tipo]
}

// ObrigatoriosTransporteFechamento — INT-001 para área transporte (BRF-003).
var ObrigatoriosTransporteFechamento = []string{TipoConsumoTransbordo}

func ValidateTransporteRegistro(user *domain.Usuario, tipo string, payload map[string]any) error {
	if !IsTransporteTipo(tipo) {
		return nil
	}
	if IsSimuladorCentral(user) {
		return ValidateTransportePayload(tipo, payload)
	}
	if user.Area != AreaTransporte {
		return domain.NewDomainError(domain.ErrAcesso001, "tipo transporte nao permitido para esta area")
	}
	return ValidateTransportePayload(tipo, payload)
}

func ValidateTransportePayload(tipo string, payload map[string]any) error {
	switch tipo {
	case TipoConsumoTransbordo:
		return validateConsumoTransbordo(payload)
	case TipoCargasViagens:
		return validateCargasViagens(payload)
	default:
		return domain.NewDomainError(domain.ErrTransporte001, "tipo transporte desconhecido")
	}
}

func validateConsumoTransbordo(payload map[string]any) error {
	consumo, err := payloadFloat(payload, "consumo_lt")
	if err != nil {
		return domain.NewDomainError(domain.ErrTransporte001, "consumo invalido")
	}
	if consumo < ConsumoTransbordoMinLT || consumo > ConsumoTransbordoMaxLT {
		return domain.NewDomainError(domain.ErrTransporte001, fmt.Sprintf("consumo fora da faixa %.1f-%.1f L/t", ConsumoTransbordoMinLT, ConsumoTransbordoMaxLT))
	}
	return nil
}

func validateCargasViagens(payload map[string]any) error {
	viagem, err := payloadInt(payload, "viagem_numero")
	if err != nil || viagem < 1 {
		return domain.NewDomainError(domain.ErrTransporte001, "viagem_numero invalido")
	}
	ton, err := payloadFloat(payload, "toneladas")
	if err != nil {
		return domain.NewDomainError(domain.ErrTransporte001, "toneladas invalidas")
	}
	if ton <= 0 || ton > CargasViagensMaxTon {
		return domain.NewDomainError(domain.ErrTransporte001, "toneladas fora da faixa permitida")
	}
	if err := validateOptionalString(payload, "frente_origem"); err != nil {
		return domain.NewDomainError(domain.ErrTransporte001, "frente_origem invalida")
	}
	if err := validateOptionalString(payload, "frente_destino"); err != nil {
		return domain.NewDomainError(domain.ErrTransporte001, "frente_destino invalida")
	}
	return nil
}

func validateOptionalString(payload map[string]any, key string) error {
	v, ok := payload[key]
	if !ok || v == nil {
		return nil
	}
	s, ok := v.(string)
	if !ok {
		return fmt.Errorf("invalid type")
	}
	if s == "" {
		return fmt.Errorf("empty string")
	}
	return nil
}
