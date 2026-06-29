import { test } from '../support/fixtures';
import { orderApproved, orderRejected, orderUnderReview } from '../support/fixtures/orders';

test.describe('Consulta pedido', () => {
  test('deve exibir o pedido aprovado', async ({ orderLookupPage }) => {
    await orderLookupPage.validateOrder(orderApproved);
  });

  test('deve exibir o pedido reprovado', async ({ orderLookupPage }) => {
    await orderLookupPage.validateOrder(orderRejected);
  });

  test('deve exibir o pedido em análise', async ({ orderLookupPage }) => {
    await orderLookupPage.validateOrder(orderUnderReview);
  });

  test('deve trazer pedido não encontrado', async ({ orderLookupPage }) => {
    await orderLookupPage.searchOrder('VLO-111111');
    await orderLookupPage.expectOrderNotFound();
  });

});