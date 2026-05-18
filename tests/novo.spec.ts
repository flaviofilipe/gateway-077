import { test, expect } from '@playwright/test';

test.describe('Página /novo — formulário de evento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/novo');
  });

  test('exibe o título e os campos obrigatórios', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Adicionar evento' })).toBeVisible();

    await expect(page.getByLabel(/nome do evento/i)).toBeVisible();
    await expect(page.getByLabel(/descrição/i)).toBeVisible();
    await expect(page.getByLabel(/data de início/i)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Cidade' })).toBeVisible();
    await expect(page.getByLabel('UF')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar na rota/i })).toBeVisible();
  });

  test('mostra erros de validação ao submeter vazio', async ({ page }) => {
    await page.getByRole('button', { name: /entrar na rota/i }).click();

    await expect(page.getByText(/campo obrigatório/i).first()).toBeVisible();
  });

  test('carrega as opções de UF a partir do Airtable', async ({ page }) => {
    const ufSelect = page.getByLabel(/uf/i);
    await expect(ufSelect).toBeVisible();

    const options = await ufSelect.locator('option').allTextContents();
    const values = options.filter((o) => o.trim() && o !== 'Selecione o estado');
    expect(values.length).toBeGreaterThan(0);
  });

  test('campo de tags: cria nova tag via Enter e exibe como pill', async ({ page }) => {
    const tagInput = page.getByPlaceholder(/buscar ou criar tags/i);
    await tagInput.fill('TagTestePW');

    // Dropdown should offer "Criar tag" option
    await expect(page.getByRole('option', { name: /criar tag/i })).toBeVisible();

    // Press Enter to confirm
    await tagInput.press('Enter');

    // Pill should appear inside the tag input area
    await expect(page.getByText('TagTestePW')).toBeVisible();

    // After adding a tag the placeholder disappears; use id to check the input was cleared
    await expect(page.locator('#tags')).toHaveValue('');
  });

  test('campo de tags: seleciona sugestão existente do dropdown', async ({ page }) => {
    const tagInput = page.getByPlaceholder(/buscar ou criar tags/i);
    await tagInput.click();

    // Dropdown should appear with available tags (if any exist in Airtable)
    const dropdown = page.getByRole('listbox');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    const firstOption = dropdown.getByRole('option').first();
    const optionCount = await dropdown.getByRole('option').count();

    if (optionCount > 0) {
      const label = (await firstOption.textContent())?.trim() ?? '';
      await firstOption.click();
      // Tag pill should appear (match by partial text since "Criar tag X" includes the name)
      const pillText = label.replace(/^Criar tag\s*[""]?/, '').replace(/[""]$/, '');
      await expect(page.getByText(pillText)).toBeVisible();
    }
  });

  test('campo de tags: remove pill com botão X', async ({ page }) => {
    const tagInput = page.getByPlaceholder(/buscar ou criar tags/i);
    await tagInput.fill('TagParaRemover');
    await tagInput.press('Enter');

    await expect(page.getByText('TagParaRemover')).toBeVisible();

    await page.getByRole('button', { name: /remover tag TagParaRemover/i }).click();

    await expect(page.getByText('TagParaRemover')).not.toBeVisible();
  });

  test('preenche e envia um evento válido com sucesso', async ({ page }) => {
    const ufSelect = page.getByLabel(/uf/i);
    const options = await ufSelect.locator('option').allTextContents();
    const firstUf = options.find((o) => o.trim() && o !== 'Selecione o estado')!;

    const hoje = new Date();
    const dataInicio = hoje.toISOString().split('T')[0];
    const dataFinal = new Date(hoje.getTime() + 2 * 86400_000).toISOString().split('T')[0];

    await page.getByLabel(/nome do evento/i).fill('Playwright Test Event ' + Date.now());
    await page.getByLabel(/descrição/i).fill('Evento criado automaticamente pelo teste Playwright.');
    await page.getByLabel(/site do evento/i).fill('https://example.com');
    await page.getByLabel(/data de início/i).fill(dataInicio);
    await page.getByLabel(/data final/i).fill(dataFinal);
    await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
    await ufSelect.selectOption({ label: firstUf });

    await page.getByRole('button', { name: /entrar na rota/i }).click();

    // Toast appears before the 1.2 s redirect — match its exact text to avoid ambiguity
    await expect(
      page.getByText('Evento enviado — obrigado pela contribuição!'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('exibe erro ao submeter URL inválida', async ({ page }) => {
    const ufSelect = page.getByLabel(/uf/i);
    const options = await ufSelect.locator('option').allTextContents();
    const firstUf = options.find((o) => o.trim() && o !== 'Selecione o estado')!;

    const dataInicio = new Date().toISOString().split('T')[0];

    await page.getByLabel(/nome do evento/i).fill('Evento URL Inválida');
    await page.getByLabel(/descrição/i).fill('Testando URL inválida.');
    await page.getByLabel(/site do evento/i).fill('nao-e-uma-url');
    await page.getByLabel(/data de início/i).fill(dataInicio);
    await page.getByRole('textbox', { name: 'Cidade' }).fill('Curitiba');
    await ufSelect.selectOption({ label: firstUf });

    await page.getByRole('button', { name: /entrar na rota/i }).click();

    await expect(page.getByRole('alert').filter({ hasText: /url inválida/i })).toBeVisible({ timeout: 8000 });
  });

  test('link "Voltar para a lista" navega para /', async ({ page }) => {
    await page.getByRole('link', { name: /voltar para a lista/i }).click();
    await expect(page).toHaveURL('/');
  });
});
