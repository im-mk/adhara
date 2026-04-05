import type { OrderItem } from './OrderItem';
import type { AddressRequest } from '../shared/AddressRequest';

export type CreateOrderRequest = {
    customerId: number;
    customerName: string;
    totalAmount: number;
    shippingAddress: AddressRequest;
    billingAddress: AddressRequest;
    orderLines: Array<OrderItem>;
};

