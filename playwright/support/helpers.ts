import { expect, type Page } from "@playwright/test";

export async function preencherNumeroPedido(page: Page, numero: string) {
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible();
    await page.getByPlaceholder('Ex: VLO-ABC123').fill(numero);
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
}

export async function validarOrderStatus(page: Page, orderId: string, status: string) { 
    await expect(page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..')).toContainText(orderId);
    await expect(page.getByTestId('order-result-status')).toHaveText(status);
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

