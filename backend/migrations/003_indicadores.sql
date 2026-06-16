-- BR-INTEG-002/005: origem de registros e snapshot de indicadores para consulta

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_perfil_check CHECK (perfil IN (
    'operador_colheita', 'operador_transporte', 'tecnico_qualidade',
    'tecnico_seguranca', 'supervisor_frente', 'simulador_central'
));

ALTER TABLE registros ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'campo'
    CHECK (origem IN ('campo', 'simulador', 'central'));
ALTER TABLE registros ADD COLUMN IF NOT EXISTS ingestido_por UUID REFERENCES usuarios(id);

CREATE TABLE indicadores_turno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turno_id UUID NOT NULL UNIQUE REFERENCES turnos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    frente_id UUID NOT NULL REFERENCES frentes(id),
    unidade_id UUID NOT NULL REFERENCES unidades(id),
    area TEXT NOT NULL,
    snapshot JSONB NOT NULL DEFAULT '{}',
    origem TEXT NOT NULL DEFAULT 'simulador' CHECK (origem IN ('simulador', 'central')),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_indicadores_frente ON indicadores_turno (frente_id);
CREATE INDEX idx_indicadores_usuario ON indicadores_turno (usuario_id);

INSERT INTO usuarios (id, email, senha_hash, nome, perfil, area, unidade_ids, frente_ids) VALUES
    ('77777777-7777-7777-7777-777777777777', 'simulador@cocal.dev',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Simulador Central', 'simulador_central', 'supervisao',
     ARRAY['11111111-1111-1111-1111-111111111111']::UUID[],
     ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc']::UUID[])
ON CONFLICT (email) DO NOTHING;
