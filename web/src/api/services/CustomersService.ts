import type { CreateCustomerRequest } from '../models/customer/CreateCustomerRequest';
import type { Customer } from '../models/customer/Customer';
import type { UpdateCustomerRequest } from '../models/customer/UpdateCustomerRequest';
import { requestWithAuth } from './httpClient';

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

    public static createCustomer(requestBody?: CreateCustomerRequest): Promise<Customer> {
        return requestWithAuth<Customer>('/Customers', {
            method: 'POST',
            body: requestBody,
        });
    }
}
