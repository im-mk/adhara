/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCustomerRequest } from '../models/CreateCustomerRequest';
import type { Customer } from '../models/Customer';
import type { UpdateCustomerRequest } from '../models/UpdateCustomerRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomersService {
    /**
     * @param customerId
     * @returns Customer OK
     * @throws ApiError
     */
    public static getCustomerById(
        customerId: number,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Customers/{customerId}',
            path: {
                'customerId': customerId,
            },
        });
    }
    /**
     * @param customerId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static updateCustomer(
        customerId: number,
        requestBody?: UpdateCustomerRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/Customers/{customerId}',
            path: {
                'customerId': customerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param customerId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteCustomer(
        customerId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Customers/{customerId}',
            path: {
                'customerId': customerId,
            },
        });
    }
    /**
     * @returns Customer OK
     * @throws ApiError
     */
    public static getAllCustomers(): CancelablePromise<Array<Customer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Customers',
        });
    }
    /**
     * @param requestBody
     * @returns Customer OK
     * @throws ApiError
     */
    public static createCustomer(
        requestBody?: CreateCustomerRequest,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Customers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
