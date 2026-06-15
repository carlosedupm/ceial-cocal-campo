-- BR-TURNO-002: partial unique index for one open turno per user
-- BR-SYNC-005: unique idempotency_key on registros

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN (
        'operador_colheita', 'operador_transporte', 'tecnico_qualidade',
        'tecnico_seguranca', 'supervisor_frente'
    )),
    area TEXT NOT NULL CHECK (area IN (
        'colheita', 'transporte', 'qualidade', 'seguranca', 'supervisao'
    )),
    unidade_ids UUID[] NOT NULL DEFAULT '{}',
    frente_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE frentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidades(id),
    nome TEXT NOT NULL
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE turno_status AS ENUM ('aberto', 'fechado');

CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    unidade_id UUID NOT NULL REFERENCES unidades(id),
    frente_id UUID NOT NULL REFERENCES frentes(id),
    area TEXT NOT NULL,
    status turno_status NOT NULL DEFAULT 'aberto',
    inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
    fim TIMESTAMPTZ,
    device_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_turno_usuario_aberto ON turnos (usuario_id) WHERE status = 'aberto';

CREATE TABLE registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turno_id UUID NOT NULL REFERENCES turnos(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    payload JSONB NOT NULL DEFAULT '{}',
    payload_hash TEXT NOT NULL,
    device_id TEXT NOT NULL,
    evento_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registros_turno ON registros (turno_id);
