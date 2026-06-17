-- BR-INTEG-006: painel Gestão à Vista por unidade (snapshot pré-agregado do central)

CREATE TABLE painel_unidade (
    unidade_id UUID PRIMARY KEY REFERENCES unidades(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL,
    origem TEXT NOT NULL CHECK (origem IN ('simulador', 'central')),
    ingestido_por UUID REFERENCES usuarios(id),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed exemplo — Paraguaçu Paulista (valores de referência EspecNew1/EspecNew2)
INSERT INTO painel_unidade (unidade_id, snapshot, origem, atualizado_em) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '{
      "atualizado_em": "2025-08-12T05:30:39Z",
      "seguranca": {
        "dias_sem_acidentes": [
          {"tipo": "unidade", "rotulo": "Paraguacu Paulista", "dias": 1838},
          {"tipo": "unidade", "rotulo": "Narandiba", "dias": 1243},
          {"tipo": "operacao", "rotulo": "Colheita", "dias": 3224},
          {"tipo": "operacao", "rotulo": "Transporte", "dias": 2443}
        ]
      },
      "performance": {
        "entrada_cana": {
          "unidade_medida": "ton",
          "direcao": "maior_melhor",
          "horizontes": {
            "diario": {"planejado": 2583, "executado": 0, "disponibilidade": "disponivel"},
            "safra": {"planejado": 1283751, "executado": 252797, "disponibilidade": "disponivel"}
          }
        },
        "densidade": {
          "unidade_medida": "ton/carga",
          "direcao": "maior_melhor",
          "horizontes": {
            "diario": {"planejado": 69, "executado": 0, "disponibilidade": "disponivel"},
            "safra": {"planejado": 69, "executado": 72, "disponibilidade": "disponivel"}
          }
        },
        "atr": {
          "unidade_medida": "kg/ton",
          "direcao": "maior_melhor",
          "horizontes": {
            "diario": {"planejado": 126, "executado": 0, "disponibilidade": "disponivel"},
            "safra": {"planejado": 126, "executado": 126, "disponibilidade": "disponivel"}
          }
        },
        "horas_corte": {
          "unidade_medida": "h",
          "direcao": "maior_melhor",
          "horizontes": {
            "diario": {"planejado": "12:00", "executado": "13:10", "disponibilidade": "disponivel"},
            "safra": {"planejado": "11:00", "executado": "11:51", "disponibilidade": "disponivel"}
          }
        },
        "consumo_transbordo": {
          "unidade_medida": "L/t",
          "direcao": "menor_melhor",
          "horizontes": {
            "semanal": {"planejado": 0.42, "executado": 0.44, "disponibilidade": "disponivel"},
            "safra": {"planejado": 0.42, "executado": 0.50, "disponibilidade": "disponivel"}
          }
        },
        "consumo_colhedora": {
          "unidade_medida": "L/t",
          "direcao": "menor_melhor",
          "horizontes": {
            "semanal": {"planejado": 0.80, "executado": 0.65, "disponibilidade": "disponivel"},
            "safra": {"planejado": 0.80, "executado": 0.84, "disponibilidade": "disponivel"}
          }
        }
      },
      "qualidade": {
        "impureza_mineral": {
          "unidade_medida": "kg/ton",
          "direcao": "menor_melhor",
          "horizontes": {
            "diario": {"planejado": 9, "executado": 0, "disponibilidade": "disponivel"},
            "safra": {"planejado": 9, "executado": 9, "disponibilidade": "disponivel"}
          }
        },
        "impureza_vegetal": {
          "unidade_medida": "kg/ton",
          "direcao": "menor_melhor",
          "horizontes": {
            "diario": {"planejado": 90, "executado": 0, "disponibilidade": "disponivel"},
            "safra": {"planejado": 90, "executado": 100, "disponibilidade": "disponivel"}
          }
        },
        "perdas": {
          "unidade_medida": "%",
          "direcao": "menor_melhor",
          "horizontes": {
            "semanal": {"planejado": 3.0, "executado": 2.03, "disponibilidade": "disponivel"},
            "safra": {"planejado": 3.0, "executado": 1.85, "disponibilidade": "disponivel"}
          }
        },
        "pisoteio": {
          "unidade_medida": "%",
          "direcao": "menor_melhor",
          "horizontes": {
            "semanal": {"planejado": 3.0, "executado": 0.78, "disponibilidade": "disponivel"},
            "safra": {"planejado": 3.0, "executado": 1.57, "disponibilidade": "disponivel"}
          }
        },
        "abalo_arranquio": {
          "unidade_medida": "%",
          "direcao": "menor_melhor",
          "horizontes": {
            "semanal": {"planejado": 2.8, "executado": 0.35, "disponibilidade": "disponivel"},
            "safra": {"planejado": 2.8, "executado": 2.03, "disponibilidade": "disponivel"}
          }
        }
      }
    }'::jsonb,
    'simulador',
    '2025-08-12T05:30:39Z'
) ON CONFLICT (unidade_id) DO NOTHING;
