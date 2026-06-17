import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api/client";
import { refreshContextoCatalog } from "@/lib/catalog/contexto-cache";
import { postLoginPath } from "@/lib/auth/routes";
import { saveSession } from "@/lib/auth/session";
import { clearTurnoIfUsuarioMismatch } from "@/lib/turno/session";
import { AppLogo } from "@/components/AppLogo";
import { COPY } from "@/lib/ui/copy";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("colheita@cocal.dev");
  const [password, setPassword] = useState("campo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const pair = await api.login(email, password);
      await saveSession(pair);
      await clearTurnoIfUsuarioMismatch();
      void refreshContextoCatalog(pair.access_token);
      navigate(postLoginPath(pair.usuario.perfil));
    } catch {
      setError("Falha no login. Verifique credenciais e conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <AppLogo />
      <p className="subtitle">{COPY.loginSubtitle}</p>
      <form onSubmit={onSubmit} className="card">
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
