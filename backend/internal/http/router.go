package http

import (
	"net/http"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/config"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/handlers"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/http/middleware"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/repository"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/service"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(cfg config.Config, pool *pgxpool.Pool) http.Handler {
	userRepo := repository.NewUserRepository(pool)
	turnoRepo := repository.NewTurnoRepository(pool)
	regRepo := repository.NewRegistroRepository(pool)
	indRepo := repository.NewIndicadoresRepository(pool)

	authSvc := service.NewAuthService(cfg, userRepo)
	turnoSvc := service.NewTurnoService(turnoRepo, regRepo, userRepo)
	indSvc := service.NewIndicadoresService(turnoRepo, regRepo, indRepo, userRepo)
	syncSvc := service.NewSyncService(turnoRepo, regRepo, indSvc)

	authH := handlers.NewAuthHandler(authSvc)
	turnoH := handlers.NewTurnoHandler(turnoSvc, userRepo)
	syncH := handlers.NewSyncHandler(syncSvc)
	indH := handlers.NewIndicadoresHandler(indSvc)

	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", handlers.Health)
	r.Route("/api/v1", func(api chi.Router) {
		api.Post("/auth/login", authH.Login)
		api.Post("/auth/refresh", authH.Refresh)
		api.Post("/auth/logout", authH.Logout)

		api.Group(func(protected chi.Router) {
			protected.Use(middleware.Auth(authSvc))
			protected.Get("/me", authH.Me)
			protected.Get("/unidades", turnoH.ListUnidades)
			protected.Get("/unidades/{unidadeId}/frentes", turnoH.ListFrentes)
			protected.Post("/turnos", turnoH.Abrir)
			protected.Get("/turnos/atual", turnoH.Atual)
			protected.Get("/turnos/atual/indicadores", indH.Atual)
			protected.Get("/turnos/{id}/indicadores", indH.PorTurno)
			protected.Get("/frentes/{id}/turnos", indH.TurnosFrente)
			protected.Get("/frentes/{id}/indicadores-resumo", indH.ResumoFrente)
			protected.Post("/turnos/{id}/fechar", turnoH.Fechar)
			protected.Post("/sync/push", syncH.Push)
		})
	})

	return r
}
