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

    await page.getByRole("button", { name: "Registrar placeholder" }).click();
    await expect(page.getByTestId("registros-list")).toContainText("placeholder");
  });
});
