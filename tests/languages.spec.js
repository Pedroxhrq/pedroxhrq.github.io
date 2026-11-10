import { test, expect } from '@playwright/test';

async function expectLocale(page, locale) {
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator(`[data-language="${locale}"]`)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[data-language][aria-current="true"]')).toHaveCount(1);
}

test('explicit language URLs override saved and browser preferences', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('[data-language="pt-BR"]').click();
  await expectLocale(page, 'pt-BR');
  expect(await page.evaluate(() => localStorage.getItem('portfolio-language'))).toBe('pt-BR');
  await page.goto('/en/');
  await expectLocale(page, 'en');
  expect(await page.evaluate(() => localStorage.getItem('portfolio-language'))).toBe('pt-BR');
  await page.goto('/');
  await expectLocale(page, 'pt-BR');
  await page.goto('/pt-br/?lang=en');
  await expectLocale(page, 'en');
  await page.goto('/?lang=invalid');
  await expectLocale(page, 'pt-BR');
});

test('browser preference selects Portuguese only at the unlocalized root', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'pt-BR' });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:' + (process.env.PORTFOLIO_TEST_PORT || '4174') + '/');
    await expectLocale(page, 'pt-BR');
    await page.locator('[data-language="en"]').click();
    await expectLocale(page, 'en');
    await page.reload();
    await expectLocale(page, 'en');
  } finally {
    await context.close();
  }
});

test('Back and Forward synchronize the language with the URL', async ({ page }) => {
  await page.goto('/?lang=en');
  await page.locator('.section-nav a[href="#projects"]').click();
  await page.locator('[data-language="pt-BR"]').click();
  await expectLocale(page, 'pt-BR');
  await expect(page).toHaveURL(/\/pt-br\/#projects$/);
  await page.goBack();
  await expect(page).toHaveURL(/\?lang=en#projects$/);
  await expectLocale(page, 'en');
  await page.goForward();
  await expectLocale(page, 'pt-BR');
  await expect(page).toHaveURL(/\/pt-br\/#projects$/);
});

test('switching from a root page keeps local assets and fragment navigation valid', async ({ page, request }) => {
  for (const base of ['/', '/portfolio/']) {
    await page.goto(`${base}?lang=en`);
    await page.locator('[data-language="pt-BR"]').click();
    await expectLocale(page, 'pt-BR');
    const resources = await page.evaluate(() => [...document.querySelectorAll(
      'link[rel="stylesheet"], link[rel="preload"], link[rel="icon"], script[src]',
    )].map(node => new URL(node.getAttribute('href') || node.getAttribute('src'), document.baseURI).href));
    expect(resources.length).toBeGreaterThan(0);
    for (const resource of resources) {
      expect(new URL(resource).origin).toBe(new URL(page.url()).origin);
      expect((await request.get(resource)).status(), resource).toBe(200);
    }
    await page.locator('.section-nav a[href="#projects"]').click();
    const destination = new URL(page.url());
    expect(destination.pathname).toBe(`${base}pt-br/`);
    expect(destination.hash).toBe('#projects');
    await expectLocale(page, 'pt-BR');
  }
});

test('switching language preserves terminal state and project subpaths', async ({ page }) => {
  await page.goto('/portfolio/en/?keep=yes#projects');
  await page.evaluate(() => document.fonts.ready);
  const input = page.locator('#command-input');
  await input.fill('whoami');
  await input.press('Enter');
  await input.fill('unfinished draft');
  await input.evaluate(node => node.setSelectionRange(3, 7));
  const before = await page.evaluate(() => ({
    scroll: window.scrollY,
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    selection: [document.querySelector('#command-input').selectionStart, document.querySelector('#command-input').selectionEnd],
  }));
  await page.evaluate(() => window.portfolioI18n.setLocale('pt-BR'));
  await expectLocale(page, 'pt-BR');
  await expect(page).toHaveURL(/\/portfolio\/pt-br\/\?keep=yes#projects$/);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('unfinished draft');
  const after = await page.evaluate(() => ({
    scroll: window.scrollY,
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    selection: [document.querySelector('#command-input').selectionStart, document.querySelector('#command-input').selectionEnd],
  }));
  expect(after.selection).toEqual(before.selection);
  expect(Math.abs(after.scroll - before.scroll), JSON.stringify({ before, after })).toBeLessThanOrEqual(2);
  await expect(page.locator('.terminal-entry')).toHaveCount(1);
  await expect(page.locator('.terminal-entry')).toContainText('desenvolvedor de software');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('whoami');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('unfinished draft');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /desenvolvedor/);
  await expect(page.locator('#command-input')).toHaveAttribute('placeholder', /digite/);
  await expect(page.locator('.run-command')).toHaveAttribute('aria-label', 'Executar comando');
});

test('blocked localStorage does not break language or shortcut controls', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/pt-br/');
  await expectLocale(page, 'pt-BR');
  await page.locator('[data-language="en"]').click();
  await expectLocale(page, 'en');
  await page.locator('#keyboard-shortcuts').uncheck();
  await page.locator('.window-title').focus();
  await page.keyboard.press('?');
  await expect(page.locator('.terminal-entry')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('both static languages have readable content and working language links', async ({ page }) => {
    await page.goto('/en/');
    await expectLocale(page, 'en');
    await expect(page.locator('#projects-heading')).toContainText('Pinned projects');
    await expect(page.locator('.project:visible')).toHaveCount(5);
    await expect(page.locator('.interactive-terminal')).toBeHidden();
    await expect(page.locator('#help-button')).toBeHidden();
    await page.locator('[data-language="pt-BR"]').click();
    await expectLocale(page, 'pt-BR');
    await expect(page.locator('#projects-heading')).toContainText('Projetos fixados');
    await expect(page.locator('.project:visible')).toHaveCount(5);
    await expect(page.locator('body')).not.toContainText('Software developer');
    await page.locator('[data-language="en"]').click();
    await expectLocale(page, 'en');
  });
});
