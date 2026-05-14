import { test, expect } from '@playwright/test';

test('navega para a página inicial', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page).toHaveTitle(/Velô by Papito/);
  await expect(page.getByTestId('hero-section')).toBeVisible();
});
