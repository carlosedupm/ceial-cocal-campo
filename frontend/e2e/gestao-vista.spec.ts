import { test, expect } from "@playwright/test";

test.describe("BRF-008 Gestão à Vista", () => {
  test("supervisor vê painel completo inline em /supervisao", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("supervisor@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByTestId("supervisao-page")).toBeVisible();
    await expect(page.getByTestId("gestao-vista-resumo")).toBeVisible();
    await expect(page.getByTestId("dias-sem-acidentes")).toBeVisible();
    await expect(page.getByTestId("comparativo-performance")).toBeVisible();
    await expect(page.getByTestId("comparativo-qualidade")).toBeVisible();
    await expect(page.getByTestId("indicador-painel-entrada_cana-diario")).toBeVisible();
  });

  test("rota dedicada /gestao-a-vista exibe matriz completa", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("supervisor@cocal.dev");
    await page.getByLabel("Senha").fill("campo123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.goto("/gestao-a-vista");
    await expect(page.getByTestId("gestao-vista-page")).toBeVisible();
    await expect(page.getByTestId("comparativo-performance")).toBeVisible();
    await expect(page.getByTestId("comparativo-qualidade")).toBeVisible();
    await expect(page.getByTestId("indicador-painel-entrada_cana-diario")).toBeVisible();
  });

  test("simulador publica painel e supervisor atualiza", async ({ browser }) => {
    const simCtx = await browser.newContext();
    const supCtx = await browser.newContext();
    const simPage = await simCtx.newPage();
    const supPage = await supCtx.newPage();

    await simPage.goto("/login");
    await simPage.getByLabel("E-mail").fill("simulador@cocal.dev");
    await simPage.getByLabel("Senha").fill("campo123");
    await simPage.getByRole("button", { name: "Entrar" }).click();
    await simPage.getByRole("tab", { name: "Painel Gestão à Vista" }).click();
    await simPage.getByRole("button", { name: /Publicar exemplo/ }).click();
    await expect(simPage.getByText(/publicado com sucesso/i)).toBeVisible();

    await supPage.goto("/login");
    await supPage.getByLabel("E-mail").fill("supervisor@cocal.dev");
    await supPage.getByLabel("Senha").fill("campo123");
    await supPage.getByRole("button", { name: "Entrar" }).click();
    await expect(supPage.getByTestId("gestao-vista-resumo")).toBeVisible();
    await expect(supPage.getByTestId("comparativo-qualidade")).toBeVisible();

    await simCtx.close();
    await supCtx.close();
  });
});
