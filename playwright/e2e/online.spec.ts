import { test, expect } from '@playwright/test';

const orderId: string = 'VLO-ULGOAW';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Velô by Papito/);
});

test('navega para a página inicial', async ({ page }) => {
  await expect(page.getByTestId('hero-section')).toBeVisible();
});

test('deve exibir o pedido encontrado', async ({ page }) => {
  await expect(page.getByTestId('hero-section').getByRole('heading')).toHaveText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible();
  await page.getByPlaceholder('Ex: VLO-ABC123').fill(orderId);
  await expect(page.getByRole('button', { name: 'Buscar Pedido' })).toBeVisible();
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();
  await expect(page.getByTestId(`order-result-${orderId}`).getByRole('paragraph').filter({ hasText: orderId})).toBeVisible({ timeout: 10000});
  await expect(page.getByTestId(`order-result-${orderId}`).filter({ hasText: 'APROVADO' })).toBeVisible();
});
