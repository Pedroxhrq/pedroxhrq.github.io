import { test, expect } from '@playwright/test';

const site = 'https://pedroxhrq.github.io';

test.describe('static discovery metadata', () => {
  test.use({ javaScriptEnabled: false });

  for (const [route, locale] of [['en', 'en'], ['pt-br', 'pt-BR']]) {
    test(`${locale} has localized metadata and reciprocal language links`, async ({ page }) => {
      await page.goto(`/${route}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site}/${route}/`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `${site}/en/`);
      await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute('href', `${site}/pt-br/`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${site}/`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${site}/${route}/`);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${site}/assets/social-preview.png`);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', locale === 'en' ? /software developer/ : /desenvolvedor/);
    });
  }
});

test('sitemap and social image are served, with no local source exposure', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(`${site}/en/`);
  expect(await sitemap.text()).toContain(`${site}/pt-br/`);
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(`Sitemap: ${site}/sitemap.xml`);
  const image = await request.get('/assets/social-preview.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toMatch(/^image\/png/);
  const png = await image.body();
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  expect((await request.get('/.git/config')).status()).toBe(404);
  expect((await request.get('/README.md')).status()).toBe(404);
});

test('subpath redirect retains explicit language parameters', async ({ request }) => {
  const response = await request.get('/portfolio?lang=pt-BR', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe('/portfolio/?lang=pt-BR');
});
