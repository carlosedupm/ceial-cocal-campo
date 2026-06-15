import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";

export function SyncStatusBar() {
  const meta = useLiveQuery(() => db.sync_meta.get("global"));
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  return (
    <header className="sync-bar" data-testid="sync-status">
      <span className={online ? "online" : "offline"}>
        {online ? "Online" : "Offline"}
      </span>
      <span>Pendências: {meta?.pending_count ?? 0}</span>
      <span>
        Última sync:{" "}
        {meta?.last_success_at
          ? new Date(meta.last_success_at).toLocaleString("pt-BR")
          : "—"}
      </span>
    </header>
  );
}
