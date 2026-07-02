import { expect, Page } from '@playwright/test';

export function createCheckoutActions(page: Page) {
  const summaryTotalPrice = () => page.getByTestId('summary-total-price');

  const elements = {
    summaryTotalPrice,
  };

  async function expectCheckoutTotal(price: string) {
    await expect(summaryTotalPrice()).toHaveText(`R$ ${price}`);
  }

  return {
    elements,
    expectCheckoutTotal,
  };
}
