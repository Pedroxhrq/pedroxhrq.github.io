import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function respond(response, status, message, method, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  response.end(method === 'HEAD' ? undefined : message);
}

function isWithinRoot(filePath) {
  const localPath = relative(root, filePath);
  return localPath !== '..' && !localPath.startsWith(`..${sep}`) && !localPath.includes(':');
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    respond(response, 405, 'Method not allowed', method, { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent((request.url || '/').split('?')[0]);
  } catch {
    respond(response, 400, 'Invalid request path', method);
    return;
  }

  if (pathname === '/portfolio') {
    respond(response, 301, 'Redirecting', method, { Location: '/portfolio/' });
    return;
  }
  if (pathname.startsWith('/portfolio/')) pathname = pathname.slice('/portfolio'.length);
  if (pathname === '/') pathname = '/index.html';

  const segments = pathname.split('/');
  const allowed = ['/index.html', '/styles.css', '/i18n.js', '/app.js'].includes(pathname)
    || pathname.startsWith('/assets/');
  if (!allowed || pathname.includes('\\') || pathname.includes('\0')
      || segments.some((segment) => segment.startsWith('.'))) {
    respond(response, 404, 'Not found', method);
    return;
  }

  try {
    const filePath = await realpath(resolve(root, `.${pathname}`));
    if (!isWithinRoot(filePath) || !(await stat(filePath)).isFile()) {
      respond(response, 404, 'Not found', method);
      return;
    }
    const data = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': data.byteLength,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(method === 'HEAD' ? undefined : data);
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code)) {
      respond(response, 404, 'Not found', method);
      return;
    }
    console.error('Preview request failed:', error.message);
    respond(response, 500, 'Preview server error', method);
  }
});

server.on('error', (error) => {
  console.error(`Could not start preview: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Local: http://127.0.0.1:${port}/`);
  console.log(`Project-path preview: http://127.0.0.1:${port}/portfolio/`);
  console.log('Press Ctrl+C to stop.');
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
