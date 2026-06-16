package service

import "github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"

// BR-ACESSO-005 / BR-INTEG-005
const PerfilSimuladorCentral = "simulador_central"

func IsSimuladorCentral(user *domain.Usuario) bool {
	return user != nil && user.Perfil == PerfilSimuladorCentral
}

func IsSupervisorFrente(user *domain.Usuario) bool {
	return user != nil && user.Perfil == "supervisor_frente"
}

func IsIndicadorOperacionalTipo(tipo string) bool {
	return IsColheitaTipo(tipo) || IsTransporteTipo(tipo) || IsQualidadeTipo(tipo)
}

func SupervisorPodeLerFrente(user *domain.Usuario, frenteID string) bool {
	if user == nil {
		return false
	}
	if !IsSupervisorFrente(user) {
		return false
	}
	for _, id := range user.FrenteIDs {
		if id == frenteID {
			return true
		}
	}
	return false
}
