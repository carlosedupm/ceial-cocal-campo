import { test, expect } from "@playwright/test";

test.describe("BRF-004 qualidade (arquivado para operador)", () => {
  test("fecha turno sem avaliação obrigatória", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("qualidade@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await page.getByRole("button", { name: "Fechar turno" }).click();
    await expect(page.getByRole("heading", { name: "Contexto operacional" })).toBeVisible();
  });

  test("menu qualidade sem link de registro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("qualidade@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Abrir turno" }).click();

    await expect(page.getByText("Consultar avaliações")).toBeVisible();
    await expect(page.getByRole("link", { name: /Registrar/ })).toHaveCount(0);
  });
});
