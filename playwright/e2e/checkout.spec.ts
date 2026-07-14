import { cleanupTestOrdersByCpf } from '../support/database/seedOrders';
import { test } from '../support/fixtures';
import { CheckoutPersonalData } from '../support/interface/CheckoutPersonalData';

test.describe('Validação de Campos Obrigatórios e Dados Inválidos', () => {
  const validData: CheckoutPersonalData = {
    name: 'João',
    surname: 'Silva',
    email: 'joao.silva@email.com',
    phone: '11987654321',
    cpf: '52998224725',
    store: 'Velô Paulista - Av. Paulista, 1000',
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
