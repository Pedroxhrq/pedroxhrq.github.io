import { test, expect } from '@playwright/test';

async function command(page, value) {
  await page.locator('#command-input').fill(value);
  await page.locator('#command-input').press('Enter');
  return page.locator('.terminal-entry').last();
}

test('portfolio content and terminal work without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/en/');
  await expect(page.locator('h1')).toHaveText('Pedro Henrique');
  await expect(page.locator('.project')).toHaveCount(5);
  for (const project of await page.locator('.project').all()) {
    await expect(project).toHaveAttribute('target', '_blank');
  }
  await page.locator('#help-button').click();
  await expect(page.locator('.terminal-entry').last()).toContainText('A few things you can try');
  await page.locator('#terminal-output [data-command="projects"]').click();
  await expect(page.locator('.terminal-entry').last().locator('a')).toHaveCount(5);
  const contact = await command(page, 'contact');
  await expect(contact.locator('a[href="https://www.linkedin.com/in/pedroxhenrique/"]')).toHaveCount(1);
  await expect(await command(page, 'theme')).toContainText('Catppuccin Frappé');
  expect(errors).toEqual([]);
});

test('commands shown in the page work in both languages', async ({ page }) => {
  for (const route of ['/en/', '/pt-br/']) {
    await page.goto(route);
    for (const value of ['ls ./projects', 'ls ./projetos']) {
      const result = await command(page, value);
      await expect(result.locator('a[href^="https://github.com/Pedroxhrq/"]')).toHaveCount(5);
      await expect(result.locator('.terminal-error')).toHaveCount(0);
    }
    for (const value of ['cat contact.sh', 'cat contato.sh']) {
      const result = await command(page, value);
      await expect(result.locator('a[href="https://www.linkedin.com/in/pedroxhenrique/"]')).toHaveCount(1);
    }
  }
});

test('terminal completion, history, navigation and escaping remain usable', async ({ page }) => {
  await page.goto('/en/');
  const input = page.locator('#command-input');
  await input.fill('proj');
  await input.press('Tab');
  await expect(input).toHaveValue('projects');
  await input.press('Enter');
  await input.fill('unfinished draft');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('projects');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('unfinished draft');
  const injected = await command(page, '<img src=x onerror=alert(1)>');
  await expect(injected).toContainText('Command not found');
  await expect(page.locator('#terminal-output img')).toHaveCount(0);
  await command(page, 'cd projects');
  await expect(page.locator('#projects-heading')).toBeFocused();
  await page.keyboard.press('/');
  await expect(input).toBeFocused();
  await input.press('Escape');
  await page.keyboard.press('?');
  await expect(page.locator('.terminal-entry').last()).toContainText('A few things you can try');
  await page.locator('#clear-terminal').click();
  await expect(page.locator('.terminal-entry')).toHaveCount(0);
  await page.evaluate(() => window.portfolioI18n.setLocale('pt-BR'));
  await expect(page.locator('.terminal-entry')).toHaveCount(0);
  await input.fill('proj');
  await input.press('Tab');
  await expect(input).toHaveValue('projetos');
});

test('shortcut opt-out persists while direct controls still work', async ({ page }) => {
  await page.goto('/en/');
  const setting = page.locator('#keyboard-shortcuts');
  await expect(setting).toBeChecked();
  await setting.uncheck();
  await expect(setting).not.toBeChecked();
  await page.locator('.window-title').focus();
  await page.keyboard.press('/');
  await expect(page.locator('.window-title')).toBeFocused();
  await page.keyboard.press('?');
  await expect(page.locator('.terminal-entry')).toHaveCount(0);
  await page.locator('#help-button').click();
  await expect(page.locator('.terminal-entry')).toHaveCount(1);
  await page.reload();
  await expect(setting).not.toBeChecked();
  await page.locator('.window-title').focus();
  await page.keyboard.press('?');
  await expect(page.locator('.terminal-entry')).toHaveCount(0);
  await setting.check();
  await page.locator('.window-title').focus();
  await page.keyboard.press('/');
  await expect(page.locator('#command-input')).toBeFocused();
});

for (const language of ['en', 'pt-br']) {
  test(`${language} remains readable and fits mobile through desktop`, async ({ page }) => {
    for (const width of [320, 390, 700, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/portfolio/${language}/`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('.project')).toHaveCount(5);
      for (const control of await page.locator('[data-language]').all()) {
        await expect(control).toBeVisible();
        const box = await control.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      if (width === 320) {
        const sizes = await page.evaluate(() => Object.fromEntries(
          ['.intro-description', '.project-main p', '.project-tags', '.system-details'].map(selector => [
            selector, parseFloat(getComputedStyle(document.querySelector(selector)).fontSize),
          ]),
        ));
        expect(sizes['.intro-description']).toBeGreaterThanOrEqual(14);
        expect(sizes['.project-main p']).toBeGreaterThanOrEqual(14);
        expect(sizes['.project-tags']).toBeGreaterThanOrEqual(11);
        expect(sizes['.system-details']).toBeGreaterThanOrEqual(11);
      }
    }
  });
}
