import { Component, type ErrorInfo, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GestaoVistaPage } from "@/features/gestao-vista/GestaoVistaPage";
import { ColheitaConsultaPage } from "@/features/colheita/ColheitaConsultaPage";
import { SimuladorPage } from "@/features/simulador/SimuladorPage";
import { SupervisaoPage } from "@/features/supervisao/SupervisaoPage";
import { TurnoDetalhePage } from "@/features/supervisao/TurnoDetalhePage";
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
        <Route path="/colheita" element={<ColheitaConsultaPage />} />
        <Route path="/simulador" element={<SimuladorPage />} />
        <Route path="/gestao-a-vista" element={<GestaoVistaPage />} />
        <Route path="/supervisao" element={<SupervisaoPage />} />
        <Route path="/supervisao/turnos/:id" element={<TurnoDetalhePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
