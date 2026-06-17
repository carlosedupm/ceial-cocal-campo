import { test, expect } from "@playwright/test";

test.describe("BRF-005 colheita consulta", () => {
  test("simulador ingere e operador consulta indicadores", async ({ browser }) => {
    const simCtx = await browser.newContext();
    const opCtx = await browser.newContext();
    const simPage = await simCtx.newPage();
    const opPage = await opCtx.newPage();

    await opPage.goto("/login");
    await opPage.getByLabel("E-mail").fill("colheita@cocal.dev");
    await opPage.getByLabel("Senha").fill("campo123");
    await opPage.getByRole("button", { name: "Entrar" }).click();
    await opPage.getByRole("button", { name: "Abrir turno" }).click();
    await expect(opPage.getByTestId("colheita-consulta")).toBeVisible();

    await simPage.goto("/login");
    await simPage.getByLabel("E-mail").fill("simulador@cocal.dev");
    await simPage.getByLabel("Senha").fill("campo123");
    await simPage.getByRole("button", { name: "Entrar" }).click();
    await simPage.getByRole("button", { name: "Horas de corte" }).click();
    await expect(simPage.getByText(/ingerido com sucesso/i)).toBeVisible();

    await opPage.reload();
    await expect(opPage.getByTestId("indicador-horas_corte")).toContainText("Disponível");

    await opPage.getByRole("link", { name: /Voltar ao início/ }).first().click();
    await opPage.getByRole("button", { name: "Fechar turno" }).click();
    await expect(opPage.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();

    await simCtx.close();
    await opCtx.close();
  });

  test("fecha turno sem registro local de indicadores", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();
    await expect(page.getByTestId("colheita-consulta")).toBeVisible();

    await page.getByRole("link", { name: /Voltar ao início/ }).first().click();
    await page.getByRole("button", { name: "Fechar turno" }).click();
    await expect(page.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();
  });
});
