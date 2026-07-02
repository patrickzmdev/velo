import { test, expect } from '../support/fixtures';
import { orderApproved, orderRejected, orderUnderReview } from '../support/fixtures/orders';

test.describe('Consulta pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.goToOrderLookupPage();
  });

  test('deve exibir o pedido aprovado', async ({ app }) => {
    await app.orderLookup.validateOrder(orderApproved);
  });

  test('deve exibir o pedido reprovado', async ({ app }) => {
    await app.orderLookup.validateOrder(orderRejected);
  });

  test('deve exibir o pedido em análise', async ({ app }) => {
    await app.orderLookup.validateOrder(orderUnderReview);
  });

  test('deve trazer pedido não encontrado', async ({ app }) => {
    await app.orderLookup.searchOrder('VLO-111111');
    await app.orderLookup.expectOrderNotFound();
  });

  test('deve manter o botão de buscar desabilitado quando o campo estiver vazio ou conter apenas espaços', async ({ app }) => {
    await expect(app.orderLookup.elements.searchButton()).toBeDisabled();
    await app.orderLookup.searchOrder('   ', false);
    await expect(app.orderLookup.elements.searchButton()).toBeDisabled();
  });

});
