import { Component, type ErrorInfo, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ColheitaPage } from "@/features/colheita/ColheitaPage";
import { TransportePage } from "@/features/transporte/TransportePage";
import { QualidadePage } from "@/features/qualidade/QualidadePage";
import { LoginPage } from "@/features/auth/LoginPage";
import { HomePage } from "@/features/home/HomePage";
import { ContextoPage } from "@/features/turno/ContextoPage";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Erro de renderização:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page">
          <h1>Erro inesperado</h1>
          <p className="error">{this.state.error.message}</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Tentar novamente
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contexto" element={<ContextoPage />} />
        <Route path="/colheita" element={<ColheitaPage />} />
        <Route path="/transporte" element={<TransportePage />} />
        <Route path="/qualidade" element={<QualidadePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
