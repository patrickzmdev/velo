import { expect, type Page } from "@playwright/test";

export async function validarOrderStatus(page: Page, orderId: string, status: string) { 
    await expect(page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..')).toContainText(orderId);
    await expect(page.getByTestId(`order-result-${orderId}`).filter({ hasText: status })).toBeVisible();
}

export async function validarDadosCarro(page: Page, modelo: string, cor: string, interior: string, rodas: string) {
    await expect(page.getByRole('paragraph').filter({ hasText: /^Modelo$/ }).locator('..')).toContainText(modelo);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Cor$/ }).locator('..')).toContainText(cor);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Interior$/ }).locator('..')).toContainText(interior);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Rodas$/ }).locator('..')).toContainText(rodas);
}

export async function validarDadosCliente(page: Page, nome: string, email: string, data: string, loja?: string) {
    await expect(page.getByRole('paragraph').filter({ hasText: /^Nome$/ }).locator('..')).toContainText(nome);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Email$/ }).locator('..')).toContainText(email);
    await expect(page.getByRole('paragraph').filter({ hasText: /^Data do Pedido$/ }).locator('..')).toContainText(data);
    if(loja){
        await expect(page.getByRole('paragraph').filter({ hasText: /^Loja de Retirada$/ }).locator('..')).toContainText(loja);
    }
}

