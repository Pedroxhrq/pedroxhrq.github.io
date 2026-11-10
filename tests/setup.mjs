import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Own a direct Node child so shutdown works on Windows without a shell process tree.
export default async function setup() {
  const port = process.env.PORTFOLIO_TEST_PORT || '4174';
  const server = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, PORT: port },
    windowsHide: true,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stderr.on('data', chunk => { output = (output + chunk).slice(-8192); });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.kill('SIGTERM');
      reject(new Error(`Test server did not start within 10 seconds.\n${output}`));
    }, 10_000);
    const fail = error => {
      clearTimeout(timeout);
      reject(error);
    };
    server.once('error', fail);
    server.once('exit', code => fail(new Error(`Test server exited before it was ready (${code}).\n${output}`)));
    server.stdout.on('data', chunk => {
      output = (output + chunk).slice(-8192);
      if (output.includes(`Local: http://127.0.0.1:${port}/`)) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  return async () => {
    if (server.exitCode !== null || server.signalCode !== null) return;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('The test server did not stop.')), 5_000);
      server.once('close', () => {
        clearTimeout(timeout);
        resolve();
      });
      server.kill('SIGTERM');
    });
  };
}
