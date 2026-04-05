import type { OrderItem } from './OrderItem';
export type CreateOrderRequest = {
    customerId?: number;
    totalAmount?: number;
    orderLines?: Array<OrderItem> | null;
};

