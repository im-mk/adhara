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
    currency VARCHAR(3) NOT NULL,
    customer_id INT NOT NULL,
    payment_id INT NOT NULL,
    shipping_id INT NOT NULL,
    item_count INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_order_id PRIMARY KEY (id),
    CONSTRAINT idx_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_order_status_id FOREIGN KEY (order_status_id)
        REFERENCES public.order_statuses (id),
    CONSTRAINT fk_orders_customer_id FOREIGN KEY (customer_id)
        REFERENCES public.customers (id)
);

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

--rollback DROP INDEX IF EXISTS idx_orders_customer_id;
--rollback DROP TABLE IF EXISTS orders;
