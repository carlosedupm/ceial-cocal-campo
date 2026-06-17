import { test, expect } from "@playwright/test";

async function openSyncDiagnostic(page: import("@playwright/test").Page) {
  await page.getByTestId("sync-diagnostic").locator("summary").click();
}

test.describe("BRF-001 fundacao", () => {
  test("login e fluxo de turno online", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByTestId("colheita-consulta")).toBeVisible();
    await page.getByRole("link", { name: /Voltar ao início/ }).first().click();
    await expect(page.getByTestId("colheita-cta")).toBeVisible();
  });

  test("RBAC filtra menu visual por area", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByTestId("colheita-consulta")).toBeVisible();
    await page.getByRole("link", { name: /Voltar ao início/ }).first().click();
    await expect(page.getByTestId("colheita-cta")).toHaveAttribute("href", "/colheita");

    await page.getByRole("button", { name: "Sair" }).click();

    await page.getByLabel("E-mail").fill("transporte@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByTestId("home-atalhos")).toHaveCount(0);
    await expect(page.getByText("Consultar turno")).toHaveCount(0);
    await expect(page.getByTestId("colheita-cta")).toHaveCount(0);
    await expect(page.getByTestId("turno-info")).toBeVisible();
  });

  test("preserva fila local em falha de API e sincroniza no retry", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("transporte@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.route("**/api/v1/sync/push", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ code: "ERR-UNKNOWN", message: "temporariamente indisponivel" }),
      });
    });

    await openSyncDiagnostic(page);
    await page.getByRole("button", { name: "Registrar placeholder" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — pendente");

    await page.reload();
    await openSyncDiagnostic(page);
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — erro");

    await page.unroute("**/api/v1/sync/push");
    await page.reload();
    await openSyncDiagnostic(page);
    await expect(page.getByTestId("sync-pending-count")).toContainText("Pendências: 0");
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — sincronizado");
  });

  test("piloto mobile alterna offline e online sem perder registro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("transporte@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.context().setOffline(true);
    await openSyncDiagnostic(page);
    await page.getByRole("button", { name: "Registrar placeholder" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — pendente");
    await expect(page.getByTestId("sync-status")).toContainText("Offline");
    await expect(page.getByTestId("sync-pending-count")).toContainText("Pendências: 1");

    await page.context().setOffline(false);
    await page.reload();
    await expect(page.getByTestId("sync-pending-count")).toContainText("Pendências: 0");

    await page.context().setOffline(true);
    await expect(page.getByTestId("sync-status")).toContainText("Offline");
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.getByTestId("sync-status")).toContainText("Sincronizado");
  });
});
