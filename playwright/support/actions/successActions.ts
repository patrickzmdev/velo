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

  async function expectApproved() {
    await expect(statusTitle()).toHaveText('Pedido Aprovado!');
    await expect(statusTitle()).toHaveAttribute('data-order-status', 'APROVADO');
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
    expectApproved,
    expectOrderNumberGenerated,
    expectCustomerData,
  };
}
