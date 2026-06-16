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
    await expect(page.getByRole("button", { name: "Registrar placeholder" })).toHaveCount(0);

    await page.getByRole("link", { name: /Consultar desempenho/ }).click();
    await expect(page.getByTestId("colheita-consulta")).toBeVisible();
    await page.getByRole("link", { name: "Voltar" }).click();
    await expect(page.getByRole("link", { name: /Consultar desempenho/ })).toBeVisible();
  });

  test("RBAC filtra menu visual por area", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByRole("heading", { name: /Menu \(colheita\)/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Consultar desempenho do turno" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Consultar desempenho" })).toHaveAttribute(
      "href",
      "/colheita"
    );

    await page.getByRole("button", { name: "Sair" }).click();

    await page.getByLabel("E-mail").fill("transporte@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByRole("heading", { name: /Menu \(transporte\)/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Consultar desempenho" })).toHaveCount(0);
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

    await page.getByRole("button", { name: "Registrar placeholder" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — pendente");

    await page.reload();
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — erro");

    await page.unroute("**/api/v1/sync/push");
    await page.reload();
    await expect(page.getByTestId("sync-status")).toContainText("Pendências: 0");
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — sincronizado");
  });

  test("piloto mobile alterna offline e online sem perder registro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("transporte@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Registrar placeholder" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("placeholder — pendente");
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
  });
});
