-- Seed data for development and E2E tests

INSERT INTO unidades (id, nome) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Paraguacu Paulista'),
    ('22222222-2222-2222-2222-222222222222', 'Narandiba');

INSERT INTO frentes (id, unidade_id, nome) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Frente Colheita 01'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Frente Transporte 01');

-- password: campo123 (bcrypt)
INSERT INTO usuarios (id, email, senha_hash, nome, perfil, area, unidade_ids, frente_ids) VALUES
    ('33333333-3333-3333-3333-333333333333', 'colheita@cocal.dev',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Operador Colheita', 'operador_colheita', 'colheita',
     ARRAY['11111111-1111-1111-1111-111111111111']::UUID[],
     ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::UUID[]),
    ('44444444-4444-4444-4444-444444444444', 'transporte@cocal.dev',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Operador Transporte', 'operador_transporte', 'transporte',
     ARRAY['11111111-1111-1111-1111-111111111111']::UUID[],
     ARRAY['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::UUID[]),
    ('55555555-5555-5555-5555-555555555555', 'supervisor@cocal.dev',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Supervisor Frente', 'supervisor_frente', 'supervisao',
     ARRAY['11111111-1111-1111-1111-111111111111']::UUID[],
     ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::UUID[]);
