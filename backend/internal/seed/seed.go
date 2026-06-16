package seed

import (
	"context"

	"golang.org/x/crypto/bcrypt"
	"github.com/jackc/pgx/v5/pgxpool"
)

// EnsureDevUsers atualiza senha dos usuários @cocal.dev (campo123) após migrations.
func EnsureDevUsers(ctx context.Context, pool *pgxpool.Pool) error {
	hash, err := bcrypt.GenerateFromPassword([]byte("campo123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = pool.Exec(ctx, `
		UPDATE usuarios SET senha_hash = $1 WHERE email LIKE '%@cocal.dev'
	`, string(hash))
	if err != nil {
		return err
	}
	return ensureQualidadeDevData(ctx, pool, string(hash))
}

// ensureQualidadeDevData — BRF-004: frente e usuário de qualidade em DBs que já rodaram 002_seed antigo.
func ensureQualidadeDevData(ctx context.Context, pool *pgxpool.Pool, senhaHash string) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO frentes (id, unidade_id, nome) VALUES
			('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Frente Qualidade 01')
		ON CONFLICT (id) DO NOTHING
	`)
	if err != nil {
		return err
	}
	_, err = pool.Exec(ctx, `
		INSERT INTO usuarios (id, email, senha_hash, nome, perfil, area, unidade_ids, frente_ids) VALUES
			('66666666-6666-6666-6666-666666666666', 'qualidade@cocal.dev', $1,
			 'Tecnico Qualidade', 'tecnico_qualidade', 'qualidade',
			 ARRAY['11111111-1111-1111-1111-111111111111']::UUID[],
			 ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc']::UUID[])
		ON CONFLICT (id) DO UPDATE SET
			email = EXCLUDED.email,
			senha_hash = EXCLUDED.senha_hash,
			nome = EXCLUDED.nome,
			perfil = EXCLUDED.perfil,
			area = EXCLUDED.area,
			unidade_ids = EXCLUDED.unidade_ids,
			frente_ids = EXCLUDED.frente_ids
	`, senhaHash)
	return err
}
