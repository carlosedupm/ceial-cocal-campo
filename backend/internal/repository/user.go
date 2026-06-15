package repository

import (
	"context"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.Usuario, string, error) {
	var u domain.Usuario
	var hash string
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, email, senha_hash, nome, perfil, area,
		       COALESCE(unidade_ids, '{}'), COALESCE(frente_ids, '{}')
		FROM usuarios WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &hash, &u.Nome, &u.Perfil, &u.Area, &u.UnidadeIDs, &u.FrenteIDs)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, "", nil
	}
	if err != nil {
		return nil, "", err
	}
	return &u, hash, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.Usuario, error) {
	var u domain.Usuario
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, email, nome, perfil, area,
		       COALESCE(unidade_ids, '{}'), COALESCE(frente_ids, '{}')
		FROM usuarios WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &u.Nome, &u.Perfil, &u.Area, &u.UnidadeIDs, &u.FrenteIDs)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return &u, err
}

func (r *UserRepository) SaveRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at)
		VALUES ($1, $2, $3::timestamptz)
	`, userID, tokenHash, expiresAt)
	return err
}

func (r *UserRepository) FindRefreshToken(ctx context.Context, tokenHash string) (userID string, revoked bool, err error) {
	err = r.pool.QueryRow(ctx, `
		SELECT usuario_id::text, revoked_at IS NOT NULL
		FROM refresh_tokens
		WHERE token_hash = $1 AND expires_at > now()
	`, tokenHash).Scan(&userID, &revoked)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", false, nil
	}
	return userID, revoked, err
}

func (r *UserRepository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1
	`, tokenHash)
	return err
}

func (r *UserRepository) ListUnidades(ctx context.Context, ids []string) ([]domain.Unidade, error) {
	rows, err := r.pool.Query(ctx, `SELECT id::text, nome FROM unidades ORDER BY nome`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var all []domain.Unidade
	for rows.Next() {
		var u domain.Unidade
		if err := rows.Scan(&u.ID, &u.Nome); err != nil {
			return nil, err
		}
		all = append(all, u)
	}
	if len(ids) == 0 {
		return all, rows.Err()
	}
	allowed := map[string]bool{}
	for _, id := range ids {
		allowed[id] = true
	}
	var filtered []domain.Unidade
	for _, u := range all {
		if allowed[u.ID] {
			filtered = append(filtered, u)
		}
	}
	return filtered, rows.Err()
}

func (r *UserRepository) ListFrentes(ctx context.Context, unidadeID string, frenteIDs []string) ([]domain.Frente, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, unidade_id::text, nome FROM frentes
		WHERE unidade_id = $1 ORDER BY nome
	`, unidadeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var all []domain.Frente
	for rows.Next() {
		var f domain.Frente
		if err := rows.Scan(&f.ID, &f.UnidadeID, &f.Nome); err != nil {
			return nil, err
		}
		all = append(all, f)
	}
	if len(frenteIDs) == 0 {
		return all, rows.Err()
	}
	allowed := map[string]bool{}
	for _, id := range frenteIDs {
		allowed[id] = true
	}
	var filtered []domain.Frente
	for _, f := range all {
		if allowed[f.ID] {
			filtered = append(filtered, f)
		}
	}
	return filtered, rows.Err()
}
