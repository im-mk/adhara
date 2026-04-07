import type { AddressRequest } from '../shared/AddressRequest';

export type Customer = {
    id?: number;
    firstName?: string | null;
    lastName?: string | null;
    billingAddress?: AddressRequest;
    shippingAddress?: AddressRequest;
};

