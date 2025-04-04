--liquibase formatted sql

--changeset user:00040
--comment: order lines table

CREATE TABLE IF NOT EXISTS public.order_lines
(
    id SERIAL NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price decimal(10,2) NOT NULL,
    total decimal(10,2) NOT NULL,
    line_status integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_order_lines_id PRIMARY KEY (id),
    CONSTRAINT fk_order_lines_order_id FOREIGN KEY (order_id)
        REFERENCES public.orders (id)
);

CREATE INDEX idx_order_lines_order_id ON public.order_lines(order_id);

--rollback DROP INDEX IF EXISTS idx_order_lines_order_id;
--rollback DROP TABLE IF EXISTS public.order_lines;