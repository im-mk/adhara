import { test as base, expect, type Page } from '@playwright/test';
import { credentials } from '../utils/env.js';

type Fixtures = {
  authenticatedPage: Page;
};

const loginViaUi = async (page: Page) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

  await page.getByLabel('Username').fill(credentials.username);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/$/);
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    await loginViaUi(page);
    await use(page);
  },
});

export { expect };
