import { test, expect } from '@playwright/test';

test('should navigate to the landing page', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page).toHaveTitle(/Velô by Papito/);
  await expect(page.getByTestId('hero-section')).toBeVisible();
});
