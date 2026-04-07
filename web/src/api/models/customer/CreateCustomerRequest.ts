import type { AddressRequest } from '../shared/AddressRequest';
export type CreateCustomerRequest = {
    firstName: string;
    lastName: string;
    billingAddress: AddressRequest;
    shippingAddress: AddressRequest;
};

