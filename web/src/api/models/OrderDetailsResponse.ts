import type { Order } from './Order';
import type { OrderLineDetails } from './OrderLineDetails';
export type OrderDetailsResponse = {
    order?: Order;
    customerName?: string | null;
    orderLines?: Array<OrderLineDetails> | null;
};

