import { expect, Page } from '@playwright/test';
import { Order } from '../interface/Order';

export function createOrderLookupActions(page: Page) {
    const orderInput = () => page.getByPlaceholder('Ex: VLO-ABC123');
    const searchButton = () => page.getByRole('button', { name: 'Buscar Pedido' });

    const elements = {
        orderInput,
        searchButton,
    };

  async function goToOrderLookupPage() {
    await page.goto('/lookup');
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible();
  }

  async function searchOrder(number: string, clickSearchButton: boolean = true) {
    await elements.orderInput().fill(number);
    if (clickSearchButton) {
      await elements.searchButton().click();
    }
  }

  async function validateOrderStatus(orderId: string, status: string) {
    await expect(page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..')).toContainText(orderId);
    await expect(page.getByTestId('order-result-status')).toHaveText(status);
  }

  async function validateCarData(model: string, color: string, inside: string, wheels: string) {
    await expect(page.getByRole('paragraph').filter({ hasText: /^Modelo$/ }).locator('..')).toContainText(model);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Cor$/ }).locator('..')).toContainText(color);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Interior$/ }).locator('..')).toContainText(inside);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Rodas$/ }).locator('..')).toContainText(wheels);
  }

  async function validateUserData(name: string, email: string, data: string, store?: string) {
    await expect(page.getByRole('paragraph').filter({ hasText: /^Nome$/ }).locator('..')).toContainText(name);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Email$/ }).locator('..')).toContainText(email);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Data do Pedido$/ }).locator('..')).toContainText(data);
    if (store) {
      await expect(page.getByRole('paragraph').filter({ hasText: /^Loja de Retirada$/ }).locator('..')).toContainText(store);
    }
  }

  async function validateOrder(order: Order) {
    await searchOrder(order.number);
    await validateOrderStatus(order.number, order.status);
    await validateCarData(order.model, order.color, order.interior, order.wheels);
    await validateUserData(order.customer.name, order.customer.email, order.customer.date, order.store);
  }

  async function expectOrderNotFound() {
    await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible();
    await expect(
      page.getByRole('paragraph').filter({ hasText: 'Verifique o número do pedido e tente novamente' }),
    ).toBeVisible();
  }

  return {
    elements,
    goToOrderLookupPage,
    searchOrder,
    validateOrderStatus,
    validateCarData,
    validateUserData,
    validateOrder,
    expectOrderNotFound,
  };
}
