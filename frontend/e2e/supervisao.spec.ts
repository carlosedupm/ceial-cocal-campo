import { test, expect } from "@playwright/test";

test.describe("BRF-006 supervisão", () => {
  test("supervisor vê painel da frente após login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("supervisor@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByTestId("supervisao-page")).toBeVisible();
    await expect(page.getByTestId("turnos-equipe")).toBeVisible();
  });
});
