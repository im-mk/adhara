import { test, expect } from '../fixtures/auth.fixture.js';

const pageChecks: Array<{ path: string; assertionText: RegExp }> = [
  { path: '/', assertionText: /Home/i },
  { path: '/orders', assertionText: /Search order number/i },
  { path: '/customers', assertionText: /^Customers$/i },
  { path: '/products', assertionText: /^Products$/i },
];

test.describe('Smoke: public access and route loading', () => {
  test('redirects anonymous users from root to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('renders the login form controls', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  for (const check of pageChecks) {
    test(`loads ${check.path} for authenticated user`, async ({ authenticatedPage }) => {
      await authenticatedPage.goto(check.path);
      await expect(authenticatedPage.getByText(check.assertionText).first()).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: 'menu' })).toBeVisible();
    });
  }
});
