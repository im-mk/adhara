/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOrderRequest } from '../models/CreateOrderRequest';
import type { OrderCreatedResponse } from '../models/OrderCreatedResponse';
import type { OrderDetailsResponse } from '../models/OrderDetailsResponse';
import type { OrderListResponse } from '../models/OrderListResponse';
import type { UpdateOrderRequest } from '../models/UpdateOrderRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * @param orderId
     * @returns OrderDetailsResponse OK
     * @throws ApiError
     */
    public static getOrderById(
        orderId: number,
    ): CancelablePromise<OrderDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Orders/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @param orderId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static updateOrder(
        orderId: number,
        requestBody?: UpdateOrderRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/Orders/{orderId}',
            path: {
                'orderId': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param orderId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteOrder(
        orderId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Orders/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @param startDate
     * @param endDate
     * @returns OrderListResponse OK
     * @throws ApiError
     */
    public static getList(
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<OrderListResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Orders',
            query: {
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * @param requestBody
     * @returns OrderCreatedResponse OK
     * @throws ApiError
     */
    public static createOrder(
        requestBody?: CreateOrderRequest,
    ): CancelablePromise<OrderCreatedResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Orders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
