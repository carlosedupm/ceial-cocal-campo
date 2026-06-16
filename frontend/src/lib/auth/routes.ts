export function postLoginPath(perfil: string): string {
  if (perfil === "simulador_central") return "/simulador";
  if (perfil === "supervisor_frente") return "/supervisao";
  return "/contexto";
}
