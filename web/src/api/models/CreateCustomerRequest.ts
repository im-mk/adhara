import type { AddressRequest } from './AddressRequest';
export type CreateCustomerRequest = {
    firstName: string;
    lastName: string;
    billingAddress: AddressRequest;
    shippingAddress: AddressRequest;
};

