package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type IndicadoresRepository struct {
	pool *pgxpool.Pool
}

func NewIndicadoresRepository(pool *pgxpool.Pool) *IndicadoresRepository {
	return &IndicadoresRepository{pool: pool}
}

func (r *IndicadoresRepository) Upsert(ctx context.Context, row *domain.IndicadoresTurno) error {
	snapshotJSON, err := json.Marshal(row.Snapshot)
	if err != nil {
		return err
	}
	return r.pool.QueryRow(ctx, `
		INSERT INTO indicadores_turno (turno_id, usuario_id, frente_id, unidade_id, area, snapshot, origem, atualizado_em)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6::jsonb, $7, now())
		ON CONFLICT (turno_id) DO UPDATE SET
			snapshot = EXCLUDED.snapshot,
			origem = EXCLUDED.origem,
			atualizado_em = now()
		RETURNING id::text, atualizado_em::text
	`, row.TurnoID, row.UsuarioID, row.FrenteID, row.UnidadeID, row.Area, string(snapshotJSON), row.Origem).
		Scan(&row.ID, &row.AtualizadoEm)
}

func (r *IndicadoresRepository) GetByTurnoID(ctx context.Context, turnoID string) (*domain.IndicadoresTurno, error) {
	var row domain.IndicadoresTurno
	var snapshot map[string]any
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, turno_id::text, usuario_id::text, frente_id::text, unidade_id::text,
		       area, snapshot, origem, atualizado_em::text
		FROM indicadores_turno WHERE turno_id = $1::uuid
	`, turnoID).Scan(
		&row.ID, &row.TurnoID, &row.UsuarioID, &row.FrenteID, &row.UnidadeID,
		&row.Area, &snapshot, &row.Origem, &row.AtualizadoEm,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	row.Snapshot = snapshot
	return &row, err
}

func (r *IndicadoresRepository) ListByFrenteID(ctx context.Context, frenteID string) ([]domain.IndicadoresTurno, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, turno_id::text, usuario_id::text, frente_id::text, unidade_id::text,
		       area, snapshot, origem, atualizado_em::text
		FROM indicadores_turno WHERE frente_id = $1::uuid
		ORDER BY atualizado_em DESC
	`, frenteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.IndicadoresTurno
	for rows.Next() {
		var row domain.IndicadoresTurno
		var snapshot map[string]any
		if err := rows.Scan(
			&row.ID, &row.TurnoID, &row.UsuarioID, &row.FrenteID, &row.UnidadeID,
			&row.Area, &snapshot, &row.Origem, &row.AtualizadoEm,
		); err != nil {
			return nil, err
		}
		row.Snapshot = snapshot
		list = append(list, row)
	}
	return list, rows.Err()
}
