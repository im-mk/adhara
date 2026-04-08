import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('Journey: customer creates an order', () => {
  test('create order from a customer and land on order details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/customers');
    await expect(authenticatedPage.getByRole('heading', { name: 'Customers' })).toBeVisible();

    const createOrderButtons = authenticatedPage.getByRole('button', { name: 'Create Order' });
    const hasExistingCustomer = (await createOrderButtons.count()) > 0;

    if (hasExistingCustomer) {
      await createOrderButtons.first().click();
    } else {
      await authenticatedPage.getByRole('button', { name: 'Create Customer' }).click();
      const createCustomerDialog = authenticatedPage.getByRole('dialog', { name: 'Create Customer' });

      await createCustomerDialog.getByLabel('First Name').fill('E2E');
      await createCustomerDialog.getByLabel('Last Name').fill('Customer');
      await createCustomerDialog.getByRole('button', { name: 'Next' }).click();

      await createCustomerDialog.getByLabel('Address Line 1').fill('1 Test Street');
      await createCustomerDialog.getByLabel('Postcode').fill('10001');
      await expect(createCustomerDialog.getByLabel('Country')).toBeEnabled();
      await createCustomerDialog.getByLabel('Country').click();
      await authenticatedPage.getByRole('option').nth(1).click();
      await createCustomerDialog.getByRole('button', { name: 'Next' }).click();

      await createCustomerDialog.getByRole('button', { name: 'Save Customer' }).click();
    }

    await expect(authenticatedPage).toHaveURL(/\/customers\/\d+\/orders\/new$/);
    await expect(authenticatedPage.getByRole('heading', { name: 'Create New Order' })).toBeVisible();

    await authenticatedPage.getByLabel(/Product #1/i).click();
    await authenticatedPage.getByRole('option', { name: /ID:\s*1/i }).click();
    await authenticatedPage.getByLabel('Quantity').first().fill('1');
    await authenticatedPage.getByLabel('Discount').fill('0');

    await authenticatedPage.getByRole('button', { name: 'Create Order' }).click();

    await expect(authenticatedPage).toHaveURL(/\/orders\/\d+$/);
    await expect(authenticatedPage.getByRole('heading', { name: 'Order Details' })).toBeVisible();
    await expect(authenticatedPage.getByText(/Order Number:/i)).toBeVisible();
  });
});
