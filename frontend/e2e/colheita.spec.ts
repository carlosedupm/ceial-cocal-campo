import { test, expect } from "@playwright/test";

test.describe("BRF-002 colheita", () => {
  test("registra horas de corte e fecha turno", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.getByRole("button", { name: "Abrir turno" }).click();
    await expect(page.getByTestId("turno-info")).toBeVisible();

    await page.getByRole("link", { name: /Registrar indicadores/ }).click();
    await expect(page.getByTestId("form-horas-corte")).toBeVisible();

    await page.getByLabel("Horas").fill("7");
    await page.getByLabel("Minutos").fill("15");
    await page.getByRole("button", { name: "Registrar horas de corte" }).click();
    await expect(page.getByText("Horas de corte registrado")).toBeVisible();

    await page.getByRole("link", { name: "← Voltar" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("horas_corte");

    await page.getByRole("button", { name: "Fechar turno" }).click();
    await expect(page.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();
  });

  test("bloqueia fechamento sem horas de corte", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.getByRole("button", { name: "Fechar turno" }).click();
    await expect(page.getByText(/INT-001/)).toBeVisible();
    await expect(page.getByTestId("turno-info")).toContainText("aberto");
  });
});
