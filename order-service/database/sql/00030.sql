--liquibase formatted sql

--changeset user:00030
--comment: orders table contains order information.

CREATE TABLE IF NOT EXISTS public.orders
(
    id SERIAL NOT NULL,
    order_number VARCHAR(255) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    order_status_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,    
    customer_id INT NOT NULL,
    shipping_address_id INT NOT NULL,
    billing_address_id INT NOT NULL,
    CONSTRAINT pk_order_id PRIMARY KEY (id),
    CONSTRAINT idx_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_order_status_id FOREIGN KEY (order_status_id)
        REFERENCES public.order_statuses (id)
    CONSTRAINT fk_orders_shipping_address_id FOREIGN KEY (shipping_address_id)
        REFERENCES public.addresses (id),
    CONSTRAINT fk_orders_billing_address_id FOREIGN KEY (billing_address_id)
        REFERENCES public.addresses (id),
);

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

--rollback DROP INDEX IF EXISTS idx_orders_customer_id;
--rollback DROP TABLE IF EXISTS orders;
