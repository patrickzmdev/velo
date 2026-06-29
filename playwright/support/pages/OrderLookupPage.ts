import { expect, Page } from "@playwright/test";
import { Order } from "../interface/Order";

export class OrderLookupPage {
    constructor(private page: Page) { }

    async goToOrderLookupPage() {
        await this.page.goto('/lookup');
        await expect(this.page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible();
    }

    async searchOrder(number: string) {
        await this.page.getByPlaceholder('Ex: VLO-ABC123').fill(number);
        await this.page.getByRole('button', { name: 'Buscar Pedido' }).click();
    }

    async validateOrderStatus(orderId: string, status: string) { 
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..')).toContainText(orderId);
        await expect(this.page.getByTestId('order-result-status')).toHaveText(status);
    }
    
    async validateCarData(model: string, color: string, inside: string, wheels: string) {
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Modelo$/ }).locator('..')).toContainText(model);
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Cor$/ }).locator('..')).toContainText(color);
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Interior$/ }).locator('..')).toContainText(inside);
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Rodas$/ }).locator('..')).toContainText(wheels);
    }
    
    async validateUserData(name: string, email: string, data: string, store?: string) {
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Nome$/ }).locator('..')).toContainText(name);
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Email$/ }).locator('..')).toContainText(email);
        await expect(this.page.getByRole('paragraph').filter({ hasText: /^Data do Pedido$/ }).locator('..')).toContainText(data);
        if(store){
            await expect(this.page.getByRole('paragraph').filter({ hasText: /^Loja de Retirada$/ }).locator('..')).toContainText(store);
        }
    }

    async validateOrder(order: Order){
        await this.searchOrder(order.number);
        await this.validateOrderStatus(order.number, order.status);
        await this.validateCarData(order.model, order.color, order.interior, order.wheels);
        await this.validateUserData(order.customer.name, order.customer.email, order.customer.date, order.store)
    }

    async expectOrderNotFound() {
        await expect(this.page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible();
        await expect(
          this.page.getByRole('paragraph').filter({ hasText: 'Verifique o número do pedido e tente novamente' }),
        ).toBeVisible();
      }
}