package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RegistroRepository struct {
	pool *pgxpool.Pool
}

func NewRegistroRepository(pool *pgxpool.Pool) *RegistroRepository {
	return &RegistroRepository{pool: pool}
}

func (r *RegistroRepository) FindByIdempotencyKey(ctx context.Context, key string) (*domain.Registro, error) {
	var reg domain.Registro
	var payload map[string]any
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, turno_id::text, tipo, idempotency_key, payload,
		       device_id, evento_at::text, synced_at::text
		FROM registros WHERE idempotency_key = $1
	`, key).Scan(&reg.ID, &reg.TurnoID, &reg.Tipo, &reg.IdempotencyKey, &payload,
		&reg.DeviceID, &reg.EventoAt, &reg.SyncedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	reg.Payload = payload
	return &reg, err
}

func (r *RegistroRepository) FindByID(ctx context.Context, id string) (*domain.Registro, error) {
	var reg domain.Registro
	var payload map[string]any
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, turno_id::text, tipo, idempotency_key, payload,
		       device_id, evento_at::text, synced_at::text
		FROM registros WHERE id = $1::uuid
	`, id).Scan(&reg.ID, &reg.TurnoID, &reg.Tipo, &reg.IdempotencyKey, &payload,
		&reg.DeviceID, &reg.EventoAt, &reg.SyncedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	reg.Payload = payload
	return &reg, err
}

func (r *RegistroRepository) Create(ctx context.Context, reg *domain.Registro, payloadHash string, userID string, origem string, ingestidoPor *string) error {
	// pgx: map[string]any sem OID falha no encode; []byte vira bytea (22P02).
	// JSON como string + ::jsonb é o caminho estável.
	payloadJSON, err := json.Marshal(reg.Payload)
	if err != nil {
		return err
	}
	if origem == "" {
		origem = "campo"
	}
	return r.pool.QueryRow(ctx, `
		INSERT INTO registros (id, turno_id, usuario_id, tipo, idempotency_key, payload, payload_hash, device_id, evento_at, origem, ingestido_por)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::jsonb, $7, $8, $9::timestamptz, $10, $11::uuid)
		RETURNING synced_at::text
	`, reg.ID, reg.TurnoID, userID, reg.Tipo, reg.IdempotencyKey, string(payloadJSON), payloadHash,
		reg.DeviceID, reg.EventoAt, origem, ingestidoPor).Scan(&reg.SyncedAt)
}

func (r *RegistroRepository) ListByTurnoID(ctx context.Context, turnoID string) ([]domain.Registro, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, turno_id::text, tipo, idempotency_key, payload,
		       device_id, evento_at::text, synced_at::text, origem,
		       ingestido_por::text
		FROM registros WHERE turno_id = $1::uuid ORDER BY synced_at ASC
	`, turnoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Registro
	for rows.Next() {
		var reg domain.Registro
		var payload map[string]any
		var ingestidoPor *string
		if err := rows.Scan(&reg.ID, &reg.TurnoID, &reg.Tipo, &reg.IdempotencyKey, &payload,
			&reg.DeviceID, &reg.EventoAt, &reg.SyncedAt, &reg.Origem, &ingestidoPor); err != nil {
			return nil, err
		}
		reg.Payload = payload
		reg.IngestidoPor = ingestidoPor
		list = append(list, reg)
	}
	return list, rows.Err()
}

// IsUniqueViolation reports Postgres unique constraint violations (SQLSTATE 23505).
func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func (r *RegistroRepository) HasTipoForTurno(ctx context.Context, turnoID, tipo string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM registros WHERE turno_id = $1::uuid AND tipo = $2)
	`, turnoID, tipo).Scan(&exists)
	return exists, err
}

func (r *RegistroRepository) HasAnyTipoForTurno(ctx context.Context, turnoID string, tipos []string) (bool, error) {
	if len(tipos) == 0 {
		return true, nil
	}
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM registros WHERE turno_id = $1::uuid AND tipo = ANY($2::text[])
		)
	`, turnoID, tipos).Scan(&exists)
	return exists, err
}

func (r *RegistroRepository) GetPayloadHash(ctx context.Context, key string) (string, error) {
	var hash string
	err := r.pool.QueryRow(ctx, `SELECT payload_hash FROM registros WHERE idempotency_key = $1`, key).Scan(&hash)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	return hash, err
}
