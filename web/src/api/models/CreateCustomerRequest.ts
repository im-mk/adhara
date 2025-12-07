/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressRequest } from './AddressRequest';
export type CreateCustomerRequest = {
    firstName: string;
    lastName: string;
    billingAddress: AddressRequest;
    shippingAddress: AddressRequest;
};

