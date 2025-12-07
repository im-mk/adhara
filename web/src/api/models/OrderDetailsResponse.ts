/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from './Order';
import type { OrderLineDetails } from './OrderLineDetails';
export type OrderDetailsResponse = {
    order?: Order;
    customerName?: string | null;
    orderLines?: Array<OrderLineDetails>;
};

