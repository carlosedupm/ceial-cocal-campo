package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/config"
	apphttp "github.com/carlosedupm/ceial-cocal-campo/backend/internal/http"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/repository"
	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/seed"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	pool, err := repository.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := seed.EnsureDevUsers(ctx, pool); err != nil {
		log.Fatalf("seed: %v", err)
	}

	router := apphttp.NewRouter(cfg, pool)
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Printf("api listening on :%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownCtx)
}
