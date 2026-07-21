import { expect, Page } from '@playwright/test';
import { CheckoutPersonalData } from '../interface/CheckoutPersonalData';
import { FieldError } from '../interface/FieldError';

const CREDIT_ANALYSIS_URL = '**/functions/v1/credit-analysis';

const creditCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function createCheckoutActions(page: Page) {
  const summaryTotalPrice = () => page.getByTestId('summary-total-price');
  const storeSelect = () => page.getByLabel('Loja para Retirada');
  const termsCheckbox = () => page.getByRole('checkbox', { name: /Li e aceito/ });
  const submitButton = () => page.getByRole('button', { name: 'Confirmar Pedido' });
  const paymentAvista = () => page.getByTestId('payment-avista');
  const paymentFinanciamento = () => page.getByTestId('payment-financiamento');

  const elements = {
    summaryTotalPrice,
    storeSelect,
    termsCheckbox,
    submitButton,
    paymentAvista,
    paymentFinanciamento,
  };

  const fieldErrors = {
    name: { name: 'name', message: 'Nome deve ter pelo menos 2 caracteres' },
    surname: { name: 'surname', message: 'Sobrenome deve ter pelo menos 2 caracteres' },
    email: { name: 'email', message: 'Email inválido' },
    phone: { name: 'phone', message: 'Telefone inválido' },
    cpf: { name: 'cpf', message: 'CPF inválido' },
    store: { name: 'store', message: 'Selecione uma loja' },
    terms: { name: 'terms', message: 'Aceite os termos' },
  };

  async function goToCheckout() {
    await page.goto('/order');
    await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible();
  }

  async function expectCheckoutTotal(price: string) {
    await expect(summaryTotalPrice()).toHaveText(`R$ ${price}`);
  }

  async function fillValue(input: string, value: string) {
    await page.getByLabel(input, { exact: true }).fill(value);
  }

  async function selectStore(store: string) {
    await storeSelect().click();
    await page.getByRole('option', { name: store }).click();
  }

  async function selectPaymentMethod(method: 'avista' | 'financiamento') {
    await page.getByTestId(`payment-${method}`).click();
  }

  async function expectAvistaAmount(price: string) {
    await expect(paymentAvista()).toContainText(`R$ ${price}`);
  }

  async function acceptTerms() {
    await termsCheckbox().click();
    await expect(termsCheckbox()).toBeChecked();
  }

  async function fillPersonalData(data: CheckoutPersonalData) {
    await fillValue('Nome', data.name);
    await fillValue('Sobrenome', data.surname);
    await fillValue('Email', data.email);
    await fillValue('Telefone', data.phone);
    await fillValue('CPF', data.cpf);
    await selectStore(data.store);
  }

  async function submit() {
    await submitButton().click();
  }

  async function expectFieldError(fieldError: FieldError) {
    await expect(page.locator(`[data-testid="error-${fieldError.name}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="error-${fieldError.name}"]`)).toHaveText(fieldError.message);
  }

  async function expectNoFieldError(fieldError: string) {
    await expect(page.locator(`[data-testid="error-${fieldError}"]`)).toHaveCount(0);
  }

  async function expectStillOnCheckout() {
    await expect(page).toHaveURL(/\/order$/);
  }

  async function mockScore(score: number) {
    await page.route(CREDIT_ANALYSIS_URL, async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: creditCorsHeaders });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: { ...creditCorsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Done', score }),
      });
    });
  }

  async function expectCreditAnalysisError() {
    await expect(page.getByTestId('toast-error')).toBeVisible();
    await expect(page.getByTestId('toast-error')).toContainText(
      'Falha ao consultar análise de crédito',
    );
    await expectStillOnCheckout();
  }

  async function fillAndCheckValuesInFinancing(entrada: string, valorTotal: string) {
    const financingInfo = calculateFinancing(entrada, valorTotal);

    await fillValue('Valor da Entrada', entrada);
    await expect(page.getByText('Valor a financiar:')).toContainText(`R$ ${financingInfo.valorAFinanciar}`);
    await expect(page.getByText('Parcela (12x):')).toContainText(`R$ ${financingInfo.valueParcel}`);
    await expect(page.getByText('Total financiado:')).toContainText(`R$ ${financingInfo.totalFinancing}`);
    await expect(page.getByText('Juros totais:')).toContainText(`R$ ${financingInfo.juros}`);
  }

  function calculateFinancing(entrada: string, valorTotal: string) {
    const parseBRL = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.'));
    const formatBRL = (n: number) =>
      n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const total = parseBRL(valorTotal);
    const entryValue = parseBRL(entrada);

    const amountToFinance = Math.max(0, total - entryValue);
    const installmentValue = (amountToFinance / 12) * 1.02;
    const totalFinanced = installmentValue * 12;
    const juros = totalFinanced - amountToFinance;

    return {
      valorAFinanciar: formatBRL(amountToFinance),
      valueParcel: formatBRL(installmentValue),
      juros: formatBRL(juros),
      totalFinancing: formatBRL(totalFinanced),
    };
  }

  return {
    fieldErrors,
    elements,
    fillAndCheckValuesInFinancing,
    goToCheckout,
    expectCheckoutTotal,
    fillValue,
    selectStore,
    selectPaymentMethod,
    expectAvistaAmount,
    acceptTerms,
    fillPersonalData,
    submit,
    expectFieldError,
    expectNoFieldError,
    expectStillOnCheckout,
    expectCreditAnalysisError,
    mockScore,
  };
}
