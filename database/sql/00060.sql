--liquibase formatted sql

--changeset user:00060
--comment: customer_addresses table joins customers with addresses.
CREATE TABLE IF NOT EXISTS public.customer_addresses
(
    id SERIAL NOT NULL,
    customer_id INT NOT NULL,
    address_id INT NOT NULL,
    address_type VARCHAR(50) NOT NULL, -- e.g., 'Billing', 'Shipping'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_customer_addresses_id PRIMARY KEY (id),
    CONSTRAINT fk_customer_addresses_customer_id FOREIGN KEY (customer_id)
        REFERENCES public.customers (id),
    CONSTRAINT fk_customer_addresses_address_id FOREIGN KEY (address_id)
        REFERENCES public.addresses (id)
);

--rollback DROP TABLE IF EXISTS public.customer_addresses;