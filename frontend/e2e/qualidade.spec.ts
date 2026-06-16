import { test, expect } from "@playwright/test";

test.describe("BRF-004 qualidade", () => {
  test("registra impurezas e fecha turno", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("qualidade@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.getByRole("button", { name: "Abrir turno" }).click();
    await expect(page.getByTestId("turno-info")).toBeVisible();

    await page.getByRole("link", { name: /Registrar avaliações/ }).click();
    await expect(page.getByTestId("form-impurezas")).toBeVisible();

    await page.getByLabel("Código do talhão").first().fill("T01");
    await page.getByLabel("Impureza mineral (kg/ton)").fill("2.5");
    await page.getByLabel("Impureza vegetal (kg/ton)").fill("1.0");
    await page.getByRole("button", { name: "Registrar impurezas" }).click();
    await expect(page.getByText(/Impurezas registradas/)).toBeVisible();

    await page.getByRole("link", { name: "← Voltar" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("impurezas");

    await page.getByRole("button", { name: "Fechar turno" }).click();
    await expect(page.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();
  });

  test("bloqueia fechamento sem avaliação de qualidade", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("qualidade@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.getByRole("button", { name: "Fechar turno" }).click();
    await expect(page.getByText(/INT-001/)).toBeVisible();
    await expect(page.getByTestId("turno-info")).toContainText("aberto");
  });

  test("RBAC bloqueia colheita em /qualidade", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("colheita@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.goto("/qualidade");
    await expect(page.getByRole("heading", { name: /Olá/ })).toBeVisible();
  });
});
