import { cleanupTestOrdersByCpf } from '../support/database/seedOrders';
import { test } from '../support/fixtures';
import { OrderFlowData } from '../support/interface/OrderFlowData';

test.describe('Fluxo Completo - Configuração até Pagamento à Vista (Fluxo Feliz)', () => {
  const validData: OrderFlowData = {
    name: 'João',
    surname: 'Silva',
    email: 'joao.silva@email.com',
    phone: '11987654321',
    cpf: '82548633004',
    store: 'Velô Paulista - Av. Paulista, 1000',
    value: '40.000,00',
    color: 'Glacier Blue',
    wheels: 'Aero Wheels',
  };

  test.beforeAll(async () => {
    await cleanupTestOrdersByCpf(validData.cpf);
  });

  test.beforeEach(async ({ app }) => {
    await app.configurator.goToConfigurator();
  });

  test('deve configurar o veículo e criar um pedido aprovado com pagamento à vista', async ({ app }) => {
    await app.configurator.expectPrice(validData.value);
    await app.configurator.validateSelectedValues(validData.color, validData.wheels);

    await app.configurator.finishConfigurator();
    await app.checkout.expectCheckoutTotal(validData.value);

    await app.checkout.fillPersonalData(validData);

    await app.checkout.selectPaymentMethod('avista');
    await app.checkout.expectAvistaAmount(validData.value);
    await app.checkout.expectCheckoutTotal(validData.value);

    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.success.expectOnSuccessPage();
    await app.success.expectApproved();
    await app.success.expectOrderNumberGenerated();
    await app.success.expectCustomerData(validData);
  });
});
