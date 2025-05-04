/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from '../models/Order';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * @param orderId
     * @returns Order OK
     * @throws ApiError
     */
    public static getOrderById(
        orderId: number,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Orders/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @param startDate
     * @param endDate
     * @returns Order OK
     * @throws ApiError
     */
    public static getAll(
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<Order>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Orders',
            query: {
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
}
