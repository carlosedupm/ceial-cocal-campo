import type { SyncMeta } from "@/lib/db/schema";

export type SyncStatusDisplay = {
  statusClass: "online" | "offline";
  message: string;
  pendingCount: number;
};

export function formatSyncStatus(
  meta: SyncMeta | undefined,
  online: boolean
): SyncStatusDisplay {
  const pending = meta?.pending_count ?? 0;
  const lastAt = meta?.last_success_at;
  const lastLabel = lastAt
    ? new Date(lastAt).toLocaleString("pt-BR")
    : null;

  if (!online) {
    if (lastLabel) {
      return {
        statusClass: "offline",
        message: `Offline — dados de ${lastLabel}`,
        pendingCount: pending,
      };
    }
    return {
      statusClass: "offline",
      message: "Offline — conecte-se para atualizar",
      pendingCount: pending,
    };
  }

  if (pending > 0) {
    const itemLabel = pending === 1 ? "item" : "itens";
    return {
      statusClass: "online",
      message: `${pending} ${itemLabel} aguardando envio`,
      pendingCount: pending,
    };
  }

  if (lastLabel) {
    return {
      statusClass: "online",
      message: `Sincronizado — ${lastLabel}`,
      pendingCount: 0,
    };
  }

  return {
    statusClass: "online",
    message: "Sincronizado",
    pendingCount: 0,
  };
}
