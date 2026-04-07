import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCustomers } from './useCustomers';

const { getCustomersPagedMock, getAllCustomersMock } = vi.hoisted(() => ({
	getCustomersPagedMock: vi.fn(),
	getAllCustomersMock: vi.fn(),
}));

vi.mock('../../api', () => ({
	CustomersService: {
		getCustomersPaged: getCustomersPagedMock,
		getAllCustomers: getAllCustomersMock,
	},
}));

describe('useCustomers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads paged customers by default', async () => {
		getCustomersPagedMock.mockResolvedValue({
			items: [{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }],
			totalCount: 42,
		});

		const { result } = renderHook(() => useCustomers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(getCustomersPagedMock).toHaveBeenCalledWith(1, 10, {
			name: '',
			postcode: '',
		});
		expect(result.current.customers).toEqual([{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }]);
		expect(result.current.totalCount).toBe(42);
		expect(result.current.error).toBeNull();
	});

	it('sends filters in paginated customer request', async () => {
		getCustomersPagedMock.mockResolvedValue({
			items: [{ id: 11, firstName: 'Jane', lastName: 'Smith' }],
			totalCount: 1,
		});

		const { result } = renderHook(() => useCustomers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		act(() => {
			result.current.setNameQuery('jane');
			result.current.setPostcodeQuery('ZZ99');
		});

		await waitFor(() => {
			expect(getCustomersPagedMock).toHaveBeenLastCalledWith(1, 10, {
				name: 'jane',
				postcode: 'ZZ99',
			});
		});

		expect(result.current.customers).toHaveLength(1);
		expect(result.current.customers[0].id).toBe(11);
		expect(result.current.totalCount).toBe(1);
	});

	it('resets page to zero when a filter changes', async () => {
		getCustomersPagedMock.mockResolvedValue({
			items: [],
			totalCount: 50,
		});

		const { result } = renderHook(() => useCustomers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		act(() => {
			result.current.handlePageChange(null, 3);
		});

		expect(result.current.page).toBe(3);

		act(() => {
			result.current.setPostcodeQuery('AB');
		});

		await waitFor(() => {
			expect(result.current.page).toBe(0);
		});

		expect(getCustomersPagedMock).toHaveBeenLastCalledWith(1, 10, {
			name: '',
			postcode: 'AB',
		});
	});

	it('updates rows per page and resets page', async () => {
		getCustomersPagedMock.mockResolvedValue({
			items: [],
			totalCount: 20,
		});

		const { result } = renderHook(() => useCustomers());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		act(() => {
			result.current.handlePageChange(null, 2);
		});

		expect(result.current.page).toBe(2);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		act(() => {
			result.current.handleRowsPerPageChange({ target: { value: '25' } } as React.ChangeEvent<HTMLInputElement>);
		});

		expect(result.current.rowsPerPage).toBe(25);
		expect(result.current.page).toBe(0);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
	});
});
