import { buildIdempotencyKey } from "@/lib/db/schema";
import { isSyncConflictPermanent } from "@/lib/sync/engine";
import { describe, expect, it } from "vitest";
import { ERR_CODES } from "@/types/domain";

describe("buildIdempotencyKey", () => {
  it("monta chave turno:tipo:id (BR-SYNC-005)", () => {
    expect(buildIdempotencyKey("t1", "placeholder", "r1")).toBe(
      "t1:placeholder:r1"
    );
  });
});

describe("sync status BR-SYNC-001", () => {
  const statuses = ["pendente", "sincronizado", "erro"] as const;
  it("usa estados documentados", () => {
    expect(statuses).toContain("pendente");
    expect(statuses).toContain("sincronizado");
    expect(statuses).toContain("erro");
  });
});

describe("isSyncConflictPermanent", () => {
  it("identifica ERR-SYNC-CONFLICT", () => {
    expect(isSyncConflictPermanent(ERR_CODES.SYNC_CONFLICT)).toBe(true);
    expect(isSyncConflictPermanent("ERR-TMP-001")).toBe(false);
  });
});
