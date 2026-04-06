import type { CreateCustomerRequest } from '../models/customer/CreateCustomerRequest';
import type { Customer } from '../models/customer/Customer';
import type { UpdateCustomerRequest } from '../models/customer/UpdateCustomerRequest';
import { requestWithAuth, requestWithAuthResponse } from './httpClient';

export type PagedCustomersResult = {
    items: Array<Customer>;
    totalCount: number;
};

export class CustomersService {
    public static getCustomerById(customerId: number): Promise<Customer> {
        return requestWithAuth<Customer>(`/Customers/${customerId}`);
    }

    public static updateCustomer(customerId: number, requestBody?: UpdateCustomerRequest): Promise<void> {
        return requestWithAuth<void>(`/Customers/${customerId}`, {
            method: 'PUT',
            body: requestBody,
        });
    }

    public static deleteCustomer(customerId: number): Promise<void> {
        return requestWithAuth<void>(`/Customers/${customerId}`, {
            method: 'DELETE',
        });
    }

    public static getAllCustomers(): Promise<Array<Customer>> {
        return requestWithAuth<Array<Customer>>('/Customers');
    }

    public static async getCustomersPaged(page: number, pageSize: number): Promise<PagedCustomersResult> {
        const response = await requestWithAuthResponse<Array<Customer>>('/Customers', {
            query: {
                page,
                pageSize,
            },
        });

        const totalCountHeader = response.headers.get('x-total-count');
        const parsedTotal = totalCountHeader ? Number(totalCountHeader) : NaN;

        return {
            items: response.data ?? [],
            totalCount: Number.isFinite(parsedTotal) ? parsedTotal : (response.data?.length ?? 0),
        };
    }

    public static createCustomer(requestBody?: CreateCustomerRequest): Promise<Customer> {
        return requestWithAuth<Customer>('/Customers', {
            method: 'POST',
            body: requestBody,
        });
    }
}
