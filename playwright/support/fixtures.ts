import { test as base } from '@playwright/test';
import { OrderLookupPage } from './pages/OrderLookupPage';

export const test = base.extend<{ orderLookupPage: OrderLookupPage }>({
  orderLookupPage: async ({ page }, use) => {
    const orderLookupPage = new OrderLookupPage(page);
    await orderLookupPage.goToOrderLookupPage();
    await use(orderLookupPage);
  },
});

export { expect } from '@playwright/test';
