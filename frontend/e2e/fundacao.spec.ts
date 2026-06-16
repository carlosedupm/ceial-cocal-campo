import { test, expect } from "@playwright/test";

test.describe("BRF-001 fundacao", () => {
  test("login e fluxo de turno online", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByTestId("turno-info")).toBeVisible();
    await expect(page.getByTestId("sync-status")).toBeVisible();

    await page.getByRole("link", { name: /Registrar indicadores/ }).click();
    await page.getByRole("button", { name: "Registrar horas de corte" }).click();
    await page.getByRole("link", { name: "← Voltar" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("horas_corte");
  });

  test("RBAC filtra menu visual por area", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByRole("heading", { name: /Menu \(colheita\)/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrar indicadores de colheita" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrar indicadores" })).toHaveAttribute(
      "href",
      "/colheita"
    );
    await expect(
      page.getByRole("link", { name: "Registrar indicadores de transporte" })
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Sair" }).click();

    await page.getByLabel("E-mail").fill("transporte@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByRole("heading", { name: /Menu \(transporte\)/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Registrar indicadores de transporte" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrar indicadores" })).toHaveAttribute(
      "href",
      "/transporte"
    );
    await expect(page.getByRole("link", { name: "Registrar indicadores de colheita" })).toHaveCount(0);
  });

  test("preserva fila local em falha de API e sincroniza no retry", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();
    await page.getByRole("link", { name: /Registrar indicadores/ }).click();

    await page.route("**/api/v1/sync/push", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "ERR-UNKNOWN", message: "temporariamente indisponivel" } }),
      });
    });

    await page.getByLabel("Horas").fill("4");
    await page.getByLabel("Minutos").fill("20");
    await page.getByRole("button", { name: "Registrar horas de corte" }).click();
    await expect(page.getByText("Horas de corte registrado")).toBeVisible();
    await page.getByRole("link", { name: "← Voltar" }).click();

    await expect(page.getByTestId("sync-status")).toContainText("Pendências: 1");
    await expect(page.getByTestId("registros-list")).toContainText("horas_corte — erro");

    await page.unroute("**/api/v1/sync/push");
    await page.reload();
    await expect(page.getByTestId("sync-status")).toContainText("Pendências: 0");
    await expect(page.getByTestId("registros-list")).toContainText("horas_corte — sincronizado");
  });

  test("piloto mobile alterna offline e online sem perder registro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();
    await page.getByRole("link", { name: /Registrar indicadores/ }).click();

    await page.context().setOffline(true);
    await page.getByLabel("Horas").fill("5");
    await page.getByLabel("Minutos").fill("10");
    await page.getByRole("button", { name: "Registrar horas de corte" }).click();
    await expect(page.getByText("Horas de corte registrado")).toBeVisible();
    await page.getByRole("link", { name: "← Voltar" }).click();
    await expect(page.getByTestId("sync-status")).toContainText("Offline");
    await expect(page.getByTestId("sync-status")).toContainText("Pendências: 1");

    await page.context().setOffline(false);
    await page.reload();
    await expect(page.getByTestId("sync-status")).toContainText("Pendências: 0");

    await page.context().setOffline(true);
    await expect(page.getByTestId("sync-status")).toContainText("Offline");
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.getByTestId("sync-status")).toContainText("Online");

    await page.context().setOffline(true);
    await expect(page.getByTestId("sync-status")).toContainText("Offline");
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.getByTestId("sync-status")).toContainText("Pendências: 0");
  });
});
