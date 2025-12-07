/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from './OrderItem';
export type CreateOrderRequest = {
    customerId?: number | string;
    totalAmount?: number | string;
    orderLines?: Array<OrderItem>;
};

