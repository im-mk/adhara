--liquibase formatted sql

--changeset user:00004
--comment: Customers table to store basic customer information
CREATE TABLE IF NOT EXISTS public.customers
(
    id SERIAL NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_customers_id PRIMARY KEY (id)
);

--rollback DROP TABLE IF EXISTS public.customers;