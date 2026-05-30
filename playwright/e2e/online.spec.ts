import { test, expect } from '@playwright/test';
import { validarDadosCarro, validarDadosCliente, validarOrderStatus } from '../support/helpers';

const orderId: string = 'VLO-ULGOAW';

test.describe('Consulta pedido', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Velô by Papito/);
    await expect(page.getByTestId('hero-section').getByRole('heading')).toHaveText('Velô Sprint');
  });
  
  test('deve exibir o pedido encontrado', async ({ page }) => {
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible();
    await page.getByPlaceholder('Ex: VLO-ABC123').fill(orderId);
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
    await validarOrderStatus(page, orderId, 'APROVADO');
    await validarDadosCarro(page, 'Velô Sprint', 'Glacier Blue', 'cream', 'aero');
    await validarDadosCliente(page, 'Patrick', 'teste@teste.com', '15/05/2026');
  });
  
  test('deve trazer pedido não encontrado', async ({ page }) => {
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible();
    await page.getByPlaceholder('Ex: VLO-ABC123').fill('VLO-111111');
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Verifique o número do pedido e tente novamente' })).toBeVisible();
  });

});

