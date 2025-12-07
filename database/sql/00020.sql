--liquibase formatted sql

--changeset user:00020
--comment: products table contains product information.

CREATE TABLE IF NOT EXISTS public.products
(
    id SERIAL NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_products_id PRIMARY KEY (id)
);

-- Create indexes for the products table
CREATE INDEX idx_products_name ON public.products(product_name);

--rollback DROP INDEX IF EXISTS idx_products_name;
--rollback DROP TABLE IF EXISTS public.products;