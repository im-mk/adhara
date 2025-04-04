--liquibase formatted sql

--changeset user:00026
--comment: addresses table contains address information.

CREATE TABLE IF NOT EXISTS public.addresses
(
    id SERIAL NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    address_line3 VARCHAR(255),
    address_line4 VARCHAR(255),
    postcode VARCHAR(10) NOT NULL,
    country CHAR(2) DEFAULT 'GB' NOT NULL, -- Use ISO 3166-1 alpha-2 country code (e.g., 'GB' for the United Kingdom)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_addresses_id PRIMARY KEY (id)
);

--rollback DROP TABLE IF EXISTS public.addresses;