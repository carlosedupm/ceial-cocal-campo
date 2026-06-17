export const COPY = {
  loginSubtitle:
    "É necessário internet para entrar. Depois, você pode consultar offline por até 7 dias.",
  contextoSubtitle: "Escolha onde você está trabalhando hoje.",
  contextoOutro: "Ou escolha outro contexto",
  colheitaConsultaSubtitle: "Consulta somente leitura — dados do sistema central",
  dadosDe: (when: string) => `Dados de ${when}`,
  verDesempenho: "Ver desempenho",
  consultarDesempenhoTurno: "Consultar desempenho do turno",
  abrirTurno: "Abrir turno",
  diagnosticoSync: "Diagnóstico de sincronização",
  registrarPlaceholder: "Registrar placeholder",
  continuarCom: (frente: string, unidade: string) =>
    `Continuar com ${frente} — ${unidade}`,
  installPwa: "Instalar app na tela inicial",
  installPwaDismiss: "Agora não",
  sair: "Sair",
} as const;
