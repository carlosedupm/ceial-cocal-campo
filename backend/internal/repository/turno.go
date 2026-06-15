package repository

import (
	"context"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TurnoRepository struct {
	pool *pgxpool.Pool
}

func NewTurnoRepository(pool *pgxpool.Pool) *TurnoRepository {
	return &TurnoRepository{pool: pool}
}

func (r *TurnoRepository) Create(ctx context.Context, t *domain.Turno) error {
	return r.pool.QueryRow(ctx, `
		INSERT INTO turnos (id, usuario_id, unidade_id, frente_id, area, status, inicio, device_id)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7::timestamptz, $8)
		RETURNING inicio::text
	`, t.ID, t.UsuarioID, t.UnidadeID, t.FrenteID, t.Area, t.Status, t.Inicio, t.DeviceID).Scan(&t.Inicio)
}

func (r *TurnoRepository) GetOpenByUser(ctx context.Context, userID string) (*domain.Turno, error) {
	var t domain.Turno
	var deviceID *string
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, usuario_id::text, unidade_id::text, frente_id::text, area, status,
		       inicio::text, fim::text, device_id
		FROM turnos WHERE usuario_id = $1 AND status = 'aberto'
	`, userID).Scan(&t.ID, &t.UsuarioID, &t.UnidadeID, &t.FrenteID, &t.Area, &t.Status, &t.Inicio, &t.Fim, &deviceID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	t.DeviceID = deviceID
	return &t, err
}

func (r *TurnoRepository) GetByID(ctx context.Context, id string) (*domain.Turno, error) {
	var t domain.Turno
	var deviceID *string
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, usuario_id::text, unidade_id::text, frente_id::text, area, status,
		       inicio::text, fim::text, device_id
		FROM turnos WHERE id = $1
	`, id).Scan(&t.ID, &t.UsuarioID, &t.UnidadeID, &t.FrenteID, &t.Area, &t.Status, &t.Inicio, &t.Fim, &deviceID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	t.DeviceID = deviceID
	return &t, err
}

func (r *TurnoRepository) Close(ctx context.Context, id string, fim string) (*domain.Turno, error) {
	var t domain.Turno
	var deviceID *string
	err := r.pool.QueryRow(ctx, `
		UPDATE turnos SET status = 'fechado', fim = $2::timestamptz
		WHERE id = $1 AND status = 'aberto'
		RETURNING id::text, usuario_id::text, unidade_id::text, frente_id::text, area, status,
		          inicio::text, fim::text, device_id
	`, id, fim).Scan(&t.ID, &t.UsuarioID, &t.UnidadeID, &t.FrenteID, &t.Area, &t.Status, &t.Inicio, &t.Fim, &deviceID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	t.DeviceID = deviceID
	return &t, err
}

func (r *TurnoRepository) HasOpenTurno(ctx context.Context, userID string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM turnos WHERE usuario_id = $1 AND status = 'aberto')
	`, userID).Scan(&exists)
	return exists, err
}
