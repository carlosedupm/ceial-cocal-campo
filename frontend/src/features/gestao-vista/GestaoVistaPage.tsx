import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GestaoDashboard } from "@/components/gestao-vista/GestaoDashboard";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import {
  fetchAndCachePainelUnidade,
  startPainelPull,
  stopPainelPull,
} from "@/lib/gestao-vista/cache";
import { getUsuario, getValidAccessToken, isSessionValid } from "@/lib/auth/session";
import type { PainelUnidade } from "@/types/gestao-vista";

export function GestaoVistaPage() {
  const navigate = useNavigate();
  const [dados, setDados] = useState<PainelUnidade | null>(null);
  const [unidadeId, setUnidadeId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      const u = await getUsuario();
      if (!u) {
        navigate("/");
        return;
      }
      const allowed =
        u.perfil === "supervisor_frente" ||
        u.perfil === "simulador_central" ||
        u.unidade_ids.length > 0;
      if (!allowed) {
        navigate("/");
        return;
      }
      const uid = u.unidade_ids[0] ?? "";
      setUnidadeId(uid);
      if (!uid) {
        setErro("Nenhuma unidade associada ao usuário.");
        setLoading(false);
        return;
      }
      const token = await getValidAccessToken();
      if (!token) return;
      const row = await fetchAndCachePainelUnidade(token, uid);
      if (!row) {
        setErro("Painel não disponível. Aguarde ingestão do sistema central.");
      }
      setDados(row);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!unidadeId) return;
    startPainelPull(
      () => getValidAccessToken(),
      async () => unidadeId,
      (row) => setDados(row)
    );
    return () => stopPainelPull();
  }, [unidadeId]);

  const snap = dados?.snapshot;
  const atualizadoEm = dados?.atualizado_em ?? snap?.atualizado_em;

  return (
    <main className="page page-gestao-vista gestao-dashboard-page page-has-footer" data-testid="gestao-vista-page">
      <SyncStatusBar />
      <PageHeader
        title="Gestão à vista"
        subtitle="Consulta somente leitura — dados do sistema central"
        breadcrumbs={[{ label: "Início", to: "/" }, { label: "Gestão à vista" }]}
        backTo="/"
        backLabel="Voltar ao início"
      />
      {loading && <p>Carregando painel...</p>}
      {erro && <p className="error">{erro}</p>}
      {snap && (
        <GestaoDashboard snapshot={snap} atualizadoEm={atualizadoEm} hideHeader />
      )}
      <PageFooter backTo="/" backLabel="Voltar ao início" />
    </main>
  );
}
