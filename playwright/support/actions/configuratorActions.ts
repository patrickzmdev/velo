import { expect, Page } from '@playwright/test';
import { Color } from '../interface/Color';
import { Wheels } from '../interface/Wheels';
import { Optional } from '../interface/Optional';

export function createConfiguratorActions(page: Page) {
  const totalPrice = () => page.getByTestId('total-price');
  const checkoutButton = () => page.getByRole('button', { name: 'Monte o Seu' });

  const elements = {
    totalPrice,
    checkoutButton,
  };

  async function goToConfigurator() {
    await page.goto('/configure');
    await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible();
  }

  async function selectColor(color: Color['name']) {
    await page.getByRole('button', { name: color }).click();
  }

  async function selectWheel(wheel: Wheels['name']) {
    await page.getByRole('button', { name: wheel }).click();
  }

  async function toggleOptional(optional: Optional['name'], check: boolean = true) {
    const checkbox = page.getByRole('checkbox', { name: optional });
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: check });
  }

  async function finishConfigurator() {
    await elements.checkoutButton().click();
  }

  async function validateSelectedValues(color: Color['name'], wheel: Wheels['name']) {
    const colorSelected = color === 'Midnight Black' ? 'midnight-black' : color === 'Glacier Blue' ? 'glacier-blue' : 'lunar-white';
    const wheelSelected = wheel === 'Aero Wheels' ? 'aero' : 'sport';
    await expect(page.getByTestId('car-exterior-image')).toHaveAttribute('alt', expect.stringContaining(colorSelected));
    await expect(page.getByTestId('car-exterior-image')).toHaveAttribute('alt', expect.stringContaining(wheelSelected));
  }

  async function expectPrice(price: string) {
    await expect(elements.totalPrice()).toHaveText(`R$ ${price}`);
  }

  return {
    elements,
    goToConfigurator,
    selectColor,
    selectWheel,
    toggleOptional,
    finishConfigurator,
    expectPrice,
    validateSelectedValues,
  };
}
