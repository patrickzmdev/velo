import { cleanupTestOrdersByCpf } from '../support/database/seedOrders';
import { test } from '../support/fixtures';
import { CheckoutPersonalData } from '../support/interface/CheckoutPersonalData';
import { OrderFlowData } from '../support/interface/OrderFlowData';

test.describe('Validação de Campos Obrigatórios e Dados Inválidos', () => {
  const validData: CheckoutPersonalData = {
    name: 'João',
    surname: 'Silva',
    email: 'joao.silva@email.com',
    phone: '11987654321',
    cpf: '52998224725',
    store: 'Velô Paulista - Av. Paulista, 1000',
    paymentMethod: 'avista'
  };

  test.beforeEach(async ({ app }) => {
    await app.checkout.goToCheckout();
  });

  test('deve exibir erro em todos os campos obrigatórios ao enviar em branco', async ({ app }) => {
    await app.checkout.submit();
    await app.checkout.expectFieldError(app.checkout.fieldErrors.name);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.surname);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.email);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.phone);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.cpf);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.store);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.terms);

    await app.checkout.expectStillOnCheckout();
  });

  test('deve exigir mínimo de 2 caracteres em Nome e Sobrenome', async ({ app }) => {
    await app.checkout.fillValue('Nome', 'A');
    await app.checkout.fillValue('Sobrenome', 'B');
    await app.checkout.submit();

    await app.checkout.expectFieldError(app.checkout.fieldErrors.name);
    await app.checkout.expectFieldError(app.checkout.fieldErrors.surname);

    await app.checkout.expectStillOnCheckout();
  });

  test('deve exibir erro para e-mail em formato inválido', async ({ app }) => {
    await app.checkout.fillPersonalData({ ...validData, email: 'cliente@.com' });
    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.checkout.expectFieldError(app.checkout.fieldErrors.email);
    await app.checkout.expectStillOnCheckout();
  });

  test('deve exibir erro para CPF incompleto/inválido', async ({ app }) => {
    await app.checkout.fillPersonalData({ ...validData, cpf: '123456' });
    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.checkout.expectFieldError(app.checkout.fieldErrors.cpf);
    await app.checkout.expectStillOnCheckout();
  });

  test('deve exigir o aceite dos termos mesmo com todos os campos válidos', async ({ app }) => {
    await app.checkout.fillPersonalData(validData);
    await app.checkout.submit();

    await app.checkout.expectFieldError(app.checkout.fieldErrors.terms);
    await app.checkout.expectStillOnCheckout();
  });
});

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
    paymentMethod: 'avista',
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

    await app.checkout.selectPaymentMethod(validData.paymentMethod);
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

test.describe('Fluxo Completo - Configuração até Pagamento com Financiamento', () => {
  const validData: OrderFlowData = {
    name: 'Jose',
    surname: 'Silva',
    email: 'jose.silva@email.com',
    phone: '11987654321',
    cpf: '65369508011',
    store: 'Velô Paulista - Av. Paulista, 1000',
    value: '40.000,00',
    color: 'Glacier Blue',
    wheels: 'Aero Wheels',
    paymentMethod: 'financiamento',
  };

  test.beforeAll(async () => {
    await cleanupTestOrdersByCpf(validData.cpf);
  });

  test.beforeEach(async ({ app }) => {
    await app.configurator.goToConfigurator();
  });

  test('deve aprovar automaticamente o crédito quando o score do cliente for maior que 700', async ({ app }) => {
    await app.configurator.expectPrice(validData.value);
    await app.configurator.validateSelectedValues(validData.color, validData.wheels);

    await app.configurator.finishConfigurator();
    await app.checkout.expectCheckoutTotal(validData.value);

    await app.checkout.fillPersonalData(validData);

    await app.checkout.selectPaymentMethod(validData.paymentMethod);
    await app.checkout.fillAndCheckValuesInFinancing('30000', validData.value);

    await app.checkout.mockScore(750);

    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.success.expectOnSuccessPage();
    await app.success.expectApproved();
    await app.success.expectOrderNumberGenerated();
    await app.success.expectCustomerData(validData);
  });

  test('deve reprovar o crédito quando o score do cliente for menor ou igual a 500 e a entrada for abaixo de 50%', async ({ app }) => {
    await app.configurator.finishConfigurator();

    await app.checkout.fillPersonalData(validData);

    await app.checkout.selectPaymentMethod(validData.paymentMethod);
    await app.checkout.fillAndCheckValuesInFinancing('10000', validData.value);

    await app.checkout.mockScore(450);

    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.success.expectOnSuccessPage();
    await app.success.expectRejected();
  });

  test('deve colocar o pedido em análise quando o score do cliente estiver entre 501 e 700', async ({ app }) => {
    await app.configurator.finishConfigurator();

    await app.checkout.fillPersonalData(validData);

    await app.checkout.selectPaymentMethod(validData.paymentMethod);
    await app.checkout.fillAndCheckValuesInFinancing('10000', validData.value);

    await app.checkout.mockScore(650);

    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.success.expectOnSuccessPage();
    await app.success.expectInAnalysis();
  });

  test('deve aprovar o crédito com score menor ou igual a 500 quando a entrada for igual a 50%', async ({ app }) => {
    await app.configurator.finishConfigurator();

    await app.checkout.fillPersonalData(validData);

    await app.checkout.selectPaymentMethod(validData.paymentMethod);
    await app.checkout.fillAndCheckValuesInFinancing('20000', validData.value);

    await app.checkout.mockScore(450);

    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.success.expectOnSuccessPage();
    await app.success.expectApproved();
  });

  test('deve aprovar o crédito com score menor ou igual a 500 quando a entrada for maior que 50%', async ({ app }) => {
    await app.configurator.finishConfigurator();

    await app.checkout.fillPersonalData(validData);

    await app.checkout.selectPaymentMethod(validData.paymentMethod);
    await app.checkout.fillAndCheckValuesInFinancing('30000', validData.value);

    await app.checkout.mockScore(300);

    await app.checkout.acceptTerms();
    await app.checkout.submit();

    await app.success.expectOnSuccessPage();
    await app.success.expectApproved();
  });
});
