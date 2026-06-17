import { describe, expect, it } from "vitest";
import { formatSyncStatus } from "./format-status";

describe("formatSyncStatus", () => {
  it("offline com ultima sync mostra hora dos dados", () => {
    const result = formatSyncStatus(
      { id: "global", pending_count: 0, last_success_at: "2026-06-16T10:00:00.000Z" },
      false
    );
    expect(result.statusClass).toBe("offline");
    expect(result.message).toMatch(/^Offline — dados de /);
  });

  it("offline sem sync pede conexao", () => {
    const result = formatSyncStatus({ id: "global", pending_count: 0 }, false);
    expect(result.message).toBe("Offline — conecte-se para atualizar");
  });

  it("online com pendencias", () => {
    const result = formatSyncStatus({ id: "global", pending_count: 2 }, true);
    expect(result.message).toBe("2 itens aguardando envio");
    expect(result.pendingCount).toBe(2);
  });

  it("online sincronizado", () => {
    const result = formatSyncStatus(
      { id: "global", pending_count: 0, last_success_at: "2026-06-16T10:00:00.000Z" },
      true
    );
    expect(result.message).toMatch(/^Sincronizado — /);
  });
});
