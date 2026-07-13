import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let server;
let origin;
test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    const path = request.url === '/' ? 'fixture.html' : request.url.slice(1);
    if (path === 'fixture.html') {
      response.setHeader('content-type', 'text/html');
      response.end('<span id="hydrated" data-risklab-icon="shield-check" aria-label="Verified"></span><risklab-icon id="custom" name="chart-line" label="Trend"></risklab-icon><script type="module" src="/element.js"></script>');
      return;
    }
    try {
      response.setHeader('content-type', 'text/javascript');
      response.end(await readFile(join(process.cwd(), 'dist', path)));
    } catch { response.statusCode = 404; response.end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => new Promise((resolve) => server.close(resolve)));

test('registers, updates, and hydrates accessible icons in Chromium', async ({ page }) => {
  await page.goto(origin);
  await expect(page.locator('#custom svg')).toHaveAttribute('aria-label', 'Trend');
  await page.locator('#custom').evaluate((node) => node.setAttribute('name', 'database-check'));
  await expect(page.locator('#custom svg')).toContainText('');
  await page.evaluate(async () => {
    const module = await import('/index.js');
    module.hydrateIcons();
  });
  await expect(page.locator('#hydrated')).not.toHaveAttribute('aria-label', 'Verified');
  await expect(page.locator('#hydrated svg')).toHaveAttribute('aria-label', 'Verified');
  expect(await page.locator('svg').count()).toBe(2);
});
