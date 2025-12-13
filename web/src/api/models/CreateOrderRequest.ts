/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from './OrderItem';
export type CreateOrderRequest = {
    customerId?: number;
    totalAmount?: number;
    orderLines?: Array<OrderItem> | null;
};

