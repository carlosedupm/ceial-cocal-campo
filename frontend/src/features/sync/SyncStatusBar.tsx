import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";
import { formatSyncStatus } from "@/lib/sync/format-status";

export function SyncStatusBar() {
  const meta = useLiveQuery(() => db.sync_meta.get("global"));
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  const display = formatSyncStatus(meta, online);

  return (
    <header
      className="sync-bar"
      data-testid="sync-status"
      aria-label={`${display.message}. Pendências: ${display.pendingCount}`}
    >
      <span className={display.statusClass}>{display.message}</span>
      <span data-testid="sync-pending-count" className="sync-pending">
        Pendências: {display.pendingCount}
      </span>
    </header>
  );
}
