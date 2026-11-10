import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Render the editable vector card using the same bundled font as the website.
// Run npm ci and npx playwright install chromium before regenerating the PNG.
const root = new URL('../', import.meta.url);
const [svg, font] = await Promise.all([
  readFile(new URL('assets/social-preview.svg', root), 'utf8'),
  readFile(new URL('assets/fonts/JetBrainsMono-Regular.woff2', root)),
]);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face { font-family: "JetBrains Mono"; src: url(data:font/woff2;base64,${font.toString('base64')}) format("woff2"); font-weight: 400; }
    html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
    svg { display: block; }
  </style></head><body>${svg}</body></html>`);
  await page.evaluate(async () => {
    await document.fonts.load('400 64px "JetBrains Mono"');
    await document.fonts.ready;
  });
  const path = fileURLToPath(new URL('assets/social-preview.png', root));
  await page.screenshot({ path, type: 'png' });
  console.log('Generated assets/social-preview.png (1200 × 630).');
} finally {
  await browser.close();
}
