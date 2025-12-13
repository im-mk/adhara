--liquibase formatted sql

--changeset user:00010
--comment: order_statuses table contains the various statuses that an order can have.

CREATE TABLE IF NOT EXISTS public.order_statuses
(
    id SERIAL NOT NULL,
    status_name VARCHAR(50) NOT NULL,
    status_description VARCHAR(255),
    CONSTRAINT pk_order_statuses_id PRIMARY KEY (id)
);

--rollback DROP TABLE IF EXISTS public.order_statuses;