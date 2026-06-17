import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { exemploPainelSnapshot } from "@/lib/gestao-vista/exemplo";
import { getUsuario, getValidAccessToken } from "@/lib/auth/session";

export function SimuladorPainelTab() {
  const [unidades, setUnidades] = useState<{ id: string; nome: string }[]>([]);
  const [unidadeId, setUnidadeId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const token = await getValidAccessToken();
      const u = await getUsuario();
      if (!token || !u) return;
      const list = await api.listUnidades(token);
      const allowed = list.filter((item) => u.unidade_ids.includes(item.id));
      setUnidades(allowed);
      setUnidadeId(allowed[0]?.id ?? "");
    })();
  }, []);

  async function publicarPainel() {
    setErro(null);
    setSucesso(null);
    if (!unidadeId) {
      setErro("Selecione uma unidade.");
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      await api.putGestaoVista(token, unidadeId, exemploPainelSnapshot() as unknown as Record<string, unknown>);
      setSucesso("Painel Gestão à Vista publicado com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao publicar painel");
    }
  }

  return (
    <section className="card" data-testid="simulador-painel-tab">
      <p className="banner-simulador">Modo simulação — painel central por unidade</p>
      <h2>Painel Gestão à Vista</h2>
      <label>
        Unidade
        <select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </label>
      <p className="hint">
        Publica snapshot completo (dias sem acidentes, performance e qualidade por horizonte) espelhando
        o sistema central.
      </p>
      {erro && <p className="error">{erro}</p>}
      {sucesso && <p className="success">{sucesso}</p>}
      <button type="button" onClick={() => void publicarPainel()}>
        Publicar exemplo (EspecNew1/2)
      </button>
    </section>
  );
}
