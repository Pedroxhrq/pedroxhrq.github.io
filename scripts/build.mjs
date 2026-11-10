import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../translations.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const source = (await readFile(resolve(root, 'index.html'), 'utf8')).replace(/\r\n/g, '\n');
const messages = globalThis.portfolioMessages;
const site = new URL(source.match(/data-site-url="([^"]+)"/)?.[1]);
const paths = { en: 'en/', 'pt-BR': 'pt-br/' };
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const url = (path) => new URL(path, site).href;
const text = (locale, key) => {
  if (!(key in messages[locale])) throw new Error(`Missing ${locale} translation: ${key}`);
  return escape(messages[locale][key]);
};

function seo(locale) {
  return `<!-- SEO:start -->
    <link rel="canonical" href="${url(paths[locale])}">
    <link rel="alternate" hreflang="en" href="${url(paths.en)}">
    <link rel="alternate" hreflang="pt-BR" href="${url(paths['pt-BR'])}">
    <link rel="alternate" hreflang="x-default" href="${site.href}">
    <meta property="og:url" content="${url(paths[locale])}">
    <meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'pt_BR'}">
    <meta property="og:locale:alternate" content="${locale === 'en' ? 'pt_BR' : 'en_US'}">
    <meta property="og:image" content="${url('assets/social-preview.png')}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${text(locale, 'meta.imageAlt')}" data-i18n-content="meta.imageAlt">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${text(locale, 'meta.title')}" data-i18n-content="meta.title">
    <meta name="twitter:description" content="${text(locale, 'meta.socialDescription')}" data-i18n-content="meta.socialDescription">
    <meta name="twitter:image" content="${url('assets/social-preview.png')}">
    <meta name="twitter:image:alt" content="${text(locale, 'meta.imageAlt')}" data-i18n-content="meta.imageAlt">
    <!-- SEO:end -->`;
}

function render(locale, nested = false) {
  let html = source.replace(/(<html\b[^>]*\blang=")[^"]+/, `$1${locale}`);
  html = html.replace(/(<([a-z][\w-]*)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/gi,
    (_, opening, tag, key, closing) => opening + text(locale, key) + closing);
  html = html.replace(/<[a-z][^>]*>/gi, (tag) => {
    for (const attribute of ['aria-label', 'placeholder', 'title', 'content']) {
      const key = tag.match(new RegExp(`data-i18n-${attribute}="([^"]+)"`))?.[1];
      if (key) tag = tag.replace(new RegExp(`(\\s${attribute}=")[^"]*(")`), (_, before, after) => before + text(locale, key) + after);
    }
    const language = tag.match(/data-language="([^"]+)"/)?.[1];
    if (language) {
      tag = tag.replace(/\saria-current="[^"]*"/g, '');
      if (language === locale) tag = tag.replace(/>$/, ' aria-current="true">');
    }
    return tag;
  });
  html = html.replace(/<!-- SEO:start -->[\s\S]*?<!-- SEO:end -->/, seo(locale));
  if (nested) {
    html = html.replace(/\b(href|src)="\.\//g, '$1="../');
    html = html.replace('<!doctype html>', '<!doctype html>\n<!-- Generated from index.html and translations.js. Run npm run build to update. -->');
  }
  return html;
}

const alternates = Object.entries(paths).map(([locale, path]) =>
  `    <xhtml:link rel="alternate" hreflang="${locale}" href="${url(path)}"/>`).join('\n')
  + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${site.href}"/>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['', ...Object.values(paths)].map((path) => `  <url>\n    <loc>${url(path)}</loc>\n${alternates}\n  </url>`).join('\n')}
</urlset>
`;
const files = new Map([
  ['index.html', render('en')],
  ['en/index.html', render('en', true)],
  ['pt-br/index.html', render('pt-BR', true)],
  ['sitemap.xml', sitemap],
  ['robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${url('sitemap.xml')}\n`],
]);
let stale = false;
for (const [file, contents] of files) {
  const destination = resolve(root, file);
  if (checkOnly) {
    const existing = await readFile(destination, 'utf8').catch(() => '');
    if (existing.replace(/\r\n/g, '\n') !== contents) {
      console.error(`Outdated generated page: ${file}. Run npm run build.`);
      stale = true;
    }
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
}
if (stale) process.exitCode = 1;
else console.log(checkOnly ? 'Static language pages and discovery files are current.' : 'Generated English/Portuguese pages, social metadata, sitemap, and robots.txt.');
