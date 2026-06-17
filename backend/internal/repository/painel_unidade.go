package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PainelUnidadeRepository struct {
	pool *pgxpool.Pool
}

func NewPainelUnidadeRepository(pool *pgxpool.Pool) *PainelUnidadeRepository {
	return &PainelUnidadeRepository{pool: pool}
}

func (r *PainelUnidadeRepository) GetByUnidadeID(ctx context.Context, unidadeID string) (*domain.PainelUnidade, error) {
	var row domain.PainelUnidade
	var snapshot map[string]any
	var ingestidoPor *string
	err := r.pool.QueryRow(ctx, `
		SELECT unidade_id::text, snapshot, origem, ingestido_por::text, atualizado_em::text
		FROM painel_unidade WHERE unidade_id = $1::uuid
	`, unidadeID).Scan(&row.UnidadeID, &snapshot, &row.Origem, &ingestidoPor, &row.AtualizadoEm)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	row.Snapshot = snapshot
	row.IngestidoPor = ingestidoPor
	return &row, nil
}

func (r *PainelUnidadeRepository) Upsert(
	ctx context.Context,
	row *domain.PainelUnidade,
) error {
	snapshotJSON, err := json.Marshal(row.Snapshot)
	if err != nil {
		return err
	}
	return r.pool.QueryRow(ctx, `
		INSERT INTO painel_unidade (unidade_id, snapshot, origem, ingestido_por, atualizado_em)
		VALUES ($1::uuid, $2::jsonb, $3, $4::uuid, now())
		ON CONFLICT (unidade_id) DO UPDATE SET
			snapshot = EXCLUDED.snapshot,
			origem = EXCLUDED.origem,
			ingestido_por = EXCLUDED.ingestido_por,
			atualizado_em = now()
		RETURNING atualizado_em::text
	`, row.UnidadeID, string(snapshotJSON), row.Origem, row.IngestidoPor).
		Scan(&row.AtualizadoEm)
}
