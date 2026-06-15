-- Dados iniciais de produção — executar no Supabase SQL Editor
-- APÓS o primeiro boot da API (migration 001_init aplicada).
-- Substitua os placeholders antes de executar.
--
-- Gerar senha_hash bcrypt (no Dev Container, pasta backend/):
--   go run ./cmd/hash-password "SuaSenhaSegura"
--
-- Remover contas de dev se existirem (ex.: testes anteriores):
--   DELETE FROM usuarios WHERE email LIKE '%@cocal.dev';

-- Unidades (ajuste nomes conforme operação)
INSERT INTO unidades (id, nome) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Paraguacu Paulista'),
    ('22222222-2222-2222-2222-222222222222', 'Narandiba')
ON CONFLICT (nome) DO NOTHING;

-- Frentes (vincule à unidade correta)
INSERT INTO frentes (id, unidade_id, nome) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Frente Colheita 01'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Frente Transporte 01')
ON CONFLICT (id) DO NOTHING;

-- Usuários reais — substitua email, nome e senha_hash
-- perfil: operador_colheita | operador_transporte | tecnico_qualidade | tecnico_seguranca | supervisor_frente
-- area: colheita | transporte | qualidade | seguranca | supervisao
INSERT INTO usuarios (id, email, senha_hash, nome, perfil, area, unidade_ids, frente_ids) VALUES
    (
        gen_random_uuid(),
        'operador@empresa.com.br',
        '$2a$10$SUBSTITUA_PELO_HASH_BCRYPT',
        'Operador Colheita',
        'operador_colheita',
        'colheita',
        ARRAY['11111111-1111-1111-1111-111111111111']::UUID[],
        ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::UUID[]
    )
ON CONFLICT (email) DO NOTHING;
