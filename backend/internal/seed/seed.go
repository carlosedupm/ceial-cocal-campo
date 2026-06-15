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
	return err
}
