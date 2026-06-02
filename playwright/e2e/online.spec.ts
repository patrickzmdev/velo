import { test, expect } from '@playwright/test';
import { preencherNumeroPedido, validarDadosCarro, validarDadosCliente, validarOrderStatus } from '../support/helpers';
import { objetoPedidoAprovado, objetoPedidoReprovado, objetoPedidoEmAnalise } from '../support/fixtures/pedidos';

test.describe('Consulta pedido', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Velô by Papito/);
    await expect(page.getByTestId('hero-section').getByRole('heading')).toHaveText('Velô Sprint');
  });
  
  test('deve exibir o pedido aprovado', async ({ page }) => {
    await preencherNumeroPedido(page, objetoPedidoAprovado.numero);
    await validarOrderStatus(page, objetoPedidoAprovado.numero, objetoPedidoAprovado.status);
    await validarDadosCarro(page, objetoPedidoAprovado.modelo, objetoPedidoAprovado.cor, objetoPedidoAprovado.interior, objetoPedidoAprovado.rodas);
    await validarDadosCliente(page, objetoPedidoAprovado.cliente.nome, objetoPedidoAprovado.cliente.email, objetoPedidoAprovado.cliente.data);
  });

  test('deve exibir o pedido reprovado', async ({ page }) => {
    await preencherNumeroPedido(page, objetoPedidoReprovado.numero);
    await validarOrderStatus(page, objetoPedidoReprovado.numero, objetoPedidoReprovado.status);
    await validarDadosCarro(page, objetoPedidoReprovado.modelo, objetoPedidoReprovado.cor, objetoPedidoReprovado.interior, objetoPedidoReprovado.rodas);
    await validarDadosCliente(page, objetoPedidoReprovado.cliente.nome, objetoPedidoReprovado.cliente.email, objetoPedidoReprovado.cliente.data);
  });

  test('deve exibir o pedido em análise', async ({ page }) => {
    await preencherNumeroPedido(page, objetoPedidoEmAnalise.numero);
    await validarOrderStatus(page, objetoPedidoEmAnalise.numero, objetoPedidoEmAnalise.status);
    await validarDadosCarro(page, objetoPedidoEmAnalise.modelo, objetoPedidoEmAnalise.cor, objetoPedidoEmAnalise.interior, objetoPedidoEmAnalise.rodas);
    await validarDadosCliente(page, objetoPedidoEmAnalise.cliente.nome, objetoPedidoEmAnalise.cliente.email, objetoPedidoEmAnalise.cliente.data);
  });
  
  test('deve trazer pedido não encontrado', async ({ page }) => {
    await preencherNumeroPedido(page, 'VLO-111111');
    await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Verifique o número do pedido e tente novamente' })).toBeVisible();
  });

});

