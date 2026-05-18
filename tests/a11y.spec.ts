import { test, expect } from '@playwright/test';

test.describe('Acessibilidade — página principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('skip link está presente e leva ao conteúdo principal', async ({ page }) => {
    // Skip link must be the very first focusable element
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /ir para o conteúdo principal/i });
    await expect(skipLink).toBeFocused();

    // After activating, main receives focus
    await page.keyboard.press('Enter');
    const main = page.locator('#main-content');
    await expect(main).toBeFocused();
  });

  test('landmarks obrigatórios estão presentes', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[aria-label]')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('existe exatamente um h1 na página', async ({ page }) => {
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).toBeVisible();
  });

  test('todos os botões têm nome acessível', async ({ page }) => {
    // Wait for the event list to render
    await page.waitForSelector('main');
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      // An accessible name comes from aria-label, aria-labelledby, or inner text
      const ariaLabel  = await btn.getAttribute('aria-label');
      const innerText  = (await btn.textContent())?.trim() ?? '';
      const accessibleName = ariaLabel ?? innerText;
      expect(
        accessibleName.length,
        `Botão #${i} não tem nome acessível`,
      ).toBeGreaterThan(0);
    }
  });

  test('toggle de visualização anuncia estado ativo via aria-pressed', async ({ page }) => {
    const gridBtn     = page.getByRole('button', { name: 'Grid' });
    const timelineBtn = page.getByRole('button', { name: 'Rota' });
    const calendarBtn = page.getByRole('button', { name: 'Calendário' });

    await expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(timelineBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(calendarBtn).toHaveAttribute('aria-pressed', 'false');

    await timelineBtn.click();
    await expect(timelineBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(gridBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('botão "Passados" tem aria-expanded e aria-controls corretos', async ({ page }) => {
    // Only visible when there are past events
    const btn = page.getByRole('button', { name: /passados/i });
    const count = await btn.count();
    if (count === 0) return; // no past events in DB, skip

    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toHaveAttribute('aria-controls', 'past-events-list');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#past-events-list')).toBeVisible();
  });

  test('links externos têm rel="noopener noreferrer"', async ({ page }) => {
    await page.waitForSelector('main');
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('campo de busca tem label acessível', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: /buscar eventos/i })).toBeVisible();
  });

  test('navegação por teclado chega nas seções de eventos', async ({ page }) => {
    await page.waitForSelector('main');
    // Tab past skip link and header items
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    // At some point focus should be inside main
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.closest('main') !== null : false;
    });
    expect(focused).toBe(true);
  });
});

test.describe('Acessibilidade — agrupamento de datas', () => {
  test('eventos de outro mês não aparecem em "Este mês"', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main');

    const thisMesSection = page.locator('section[aria-label="Este mês"]');
    const count = await thisMesSection.count();
    if (count === 0) return; // section absent = no events this month, acceptable

    // Verify every event card inside "Este mês" has a date in the current month
    const now = new Date();
    const curMonth = now.getMonth(); // 0-based local (display only)

    // Cards show the month abbreviation in amber — collect them
    const monthLabels = thisMesSection.locator('.text-amber-500.uppercase');
    const total = await monthLabels.count();

    const MONTHS_PT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
    const expectedAbbr = MONTHS_PT[curMonth];

    for (let i = 0; i < total; i++) {
      const text = (await monthLabels.nth(i).textContent())?.trim() ?? '';
      // The date tile shows month abbreviation; all should match current month
      if (text.length === 3) {
        expect(text, `Evento com mês "${text}" aparece em "Este mês" mas deveria ser "${expectedAbbr}"`).toBe(expectedAbbr);
      }
    }
  });
});

test.describe('Acessibilidade — página /novo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/novo');
  });

  test('todos os campos obrigatórios têm label visível', async ({ page }) => {
    await expect(page.getByLabel(/nome do evento/i)).toBeVisible();
    await expect(page.getByLabel(/descrição/i)).toBeVisible();
    await expect(page.getByLabel(/data de início/i)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Cidade' })).toBeVisible();
    await expect(page.getByLabel('UF')).toBeVisible();
  });

  test('campos obrigatórios têm aria-required', async ({ page }) => {
    await expect(page.getByLabel(/nome do evento/i)).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel(/descrição/i)).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel(/data de início/i)).toHaveAttribute('aria-required', 'true');
  });

  test('erros de validação têm role="alert"', async ({ page }) => {
    await page.getByRole('button', { name: /entrar na rota/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('input de tags tem autocomplete acessível', async ({ page }) => {
    const tagInput = page.getByPlaceholder(/buscar ou criar tags/i);
    await expect(tagInput).toHaveAttribute('aria-autocomplete', 'list');
    await expect(tagInput).toHaveAttribute('aria-haspopup', 'listbox');

    await tagInput.fill('test');
    await expect(tagInput).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toBeVisible();
  });
});
