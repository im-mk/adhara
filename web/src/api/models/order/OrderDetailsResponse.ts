import type { Address } from '../shared/Address';
import type { Order } from './Order';
import type { OrderLineDetails } from './OrderLineDetails';
export type OrderDetailsResponse = {
    order?: Order;
    customerName?: string | null;
    billingAddress?: Address | null;
    shippingAddress?: Address | null;
    orderLines?: Array<OrderLineDetails> | null;
};

