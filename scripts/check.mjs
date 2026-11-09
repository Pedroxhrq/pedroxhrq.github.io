import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

for (const file of ['index.html', 'styles.css', 'i18n.js', 'app.js', '.nojekyll']) {
  try {
    if (!(await stat(resolve(root, file))).isFile()) errors.push(`${file} is not a file.`);
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const file of ['i18n.js', 'app.js']) {
  const syntax = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
  if (syntax.status !== 0) errors.push(syntax.stderr.trim() || `JavaScript syntax check failed: ${file}`);
}

async function verifyAsset(reference, source) {
  if (!reference || /^(?:#|[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) return;
  const assetPath = reference.split(/[?#]/)[0];
  if (!assetPath) return;
  if (assetPath.startsWith('/')) {
    errors.push(`${source}: use a relative path for GitHub project sites: ${reference}`);
    return;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(assetPath);
  } catch {
    errors.push(`${source}: invalid URL encoding: ${reference}`);
    return;
  }
  const fullPath = resolve(dirname(resolve(root, source)), decoded);
  const localPath = relative(root, fullPath);
  if (localPath === '..' || localPath.startsWith(`..${sep}`)) {
    errors.push(`${source}: asset is outside the site: ${reference}`);
    return;
  }
  try {
    if (!(await stat(fullPath)).isFile()) errors.push(`${source}: asset is not a file: ${reference}`);
  } catch {
    errors.push(`${source}: missing local asset: ${reference}`);
  }
}

try {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']*)["']/gi)) {
    await verifyAsset(match[1], 'index.html');
  }
  const css = await readFile(resolve(root, 'styles.css'), 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)) {
    await verifyAsset(match[1], 'styles.css');
  }
} catch (error) {
  if (error.code !== 'ENOENT') errors.push(error.message);
}

if (errors.length) {
  console.error(errors.map((error) => `FAIL: ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Passed: required files, JavaScript syntax, and local HTML/CSS assets.');
  console.log('Relative asset paths support both user and project GitHub Pages sites.');
}
