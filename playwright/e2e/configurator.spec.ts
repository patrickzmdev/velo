import { test } from '../support/fixtures';

test.describe('CT02 - Configuração do Veículo (Cores e Rodas) e Cálculo do Preço Base', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.goToConfigurator();
  });

  test('deve alterar a cor no preview sem impactar o preço base', async ({ app }) => {
    await app.configurator.expectPrice('40.000,00');
    await app.configurator.validateSelectedValues('Glacier Blue', 'Aero Wheels');

    await app.configurator.selectColor('Midnight Black');
    await app.configurator.validateSelectedValues('Midnight Black', 'Aero Wheels');
    await app.configurator.expectPrice('40.000,00');
  });

  test('deve atualizar o preço ao trocar as rodas', async ({ app }) => {
    await app.configurator.expectPrice('40.000,00');

    await app.configurator.selectWheel('Sport Wheels');
    await app.configurator.validateSelectedValues('Glacier Blue', 'Sport Wheels');
    await app.configurator.expectPrice('42.000,00');

    await app.configurator.selectWheel('Aero Wheels');
    await app.configurator.validateSelectedValues('Glacier Blue', 'Aero Wheels');
    await app.configurator.expectPrice('40.000,00');
  });

  test('deve atualizar o preço ao marcar e desmarcar os opcionais', async ({ app }) => {
    await app.configurator.expectPrice('40.000,00');

    await app.configurator.toggleOptional('Precision Park');
    await app.configurator.expectPrice('45.500,00');

    await app.configurator.toggleOptional('Flux Capacitor');
    await app.configurator.expectPrice('50.500,00');

    await app.configurator.toggleOptional('Precision Park', false);
    await app.configurator.toggleOptional('Flux Capacitor', false);
    await app.configurator.expectPrice('40.000,00');
  });

  test('deve persistir a configuração e o preço ao avançar para o checkout', async ({ app }) => {
    await app.configurator.toggleOptional('Precision Park');
    await app.configurator.expectPrice('45.500,00');

    await app.configurator.goToCheckout();
    await app.configurator.expectCheckoutTotal('45.500,00');
  });
});
