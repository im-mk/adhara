import { test, expect } from '../fixtures/auth.fixture.js';
import { credentials } from '../utils/env.js';

test.describe('Journey: authentication', () => {
  test('user can sign in and logout', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Username').fill(credentials.username);
    await page.getByLabel('Password').fill(credentials.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/Home/i).first()).toBeVisible();

    await page.getByRole('button', { name: 'menu' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });
});
