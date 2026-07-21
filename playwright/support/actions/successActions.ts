import { expect, Page } from '@playwright/test';
import { CheckoutPersonalData } from '../interface/CheckoutPersonalData';

export function createSuccessActions(page: Page) {
  const statusTitle = () => page.getByTestId('success-status');
  const orderId = () => page.getByTestId('order-id');

  const elements = {
    statusTitle,
    orderId,
  };

  async function expectOnSuccessPage() {
    await expect(page).toHaveURL(/\/success$/);
  }

  async function expectStatus(status: 'APROVADO' | 'REPROVADO' | 'EM_ANALISE', title: string) {
    await expect(statusTitle()).toHaveAttribute('data-order-status', status);
    await expect(statusTitle()).toHaveText(title);
  }

  async function expectApproved() {
    await expectStatus('APROVADO', 'Pedido Aprovado!');
  }

  async function expectInAnalysis() {
    await expectStatus('EM_ANALISE', 'Pedido em Análise');
  }

  async function expectRejected() {
    await expectStatus('REPROVADO', 'Crédito Reprovado');
  }

  async function expectOrderNumberGenerated() {
    await expect(orderId()).toBeVisible();
    await expect(orderId()).toHaveText(/^VLO-/);
  }

  async function expectCustomerData(data: CheckoutPersonalData) {
    await expect(
      page.getByRole('paragraph').filter({ hasText: /^Cliente$/ }).locator('..'),
    ).toContainText(`${data.name} ${data.surname}`);
    await expect(
      page.getByRole('paragraph').filter({ hasText: /^Email$/ }).locator('..'),
    ).toContainText(data.email);
    await expect(
      page.getByRole('paragraph').filter({ hasText: /^Loja de Retirada$/ }).locator('..'),
    ).toContainText(data.store);
  }

  return {
    elements,
    expectOnSuccessPage,
    expectStatus,
    expectApproved,
    expectInAnalysis,
    expectRejected,
    expectOrderNumberGenerated,
    expectCustomerData,
  };
}
