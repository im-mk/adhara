--liquibase formatted sql

--changeset user:90010
--comment: insert sample data data

-- Insert sample customers
INSERT INTO customers
    (id, first_name, last_name)
VALUES
    (1, 'John', 'Doe'),
    (2, 'Jane', 'Smith'),
    (3, 'Alice', 'Johnson'),
    (4, 'Bob', 'Brown'),
    (5, 'Charlie', 'Davis');
SELECT setval(pg_get_serial_sequence('public.customers','id'), COALESCE((SELECT MAX(id) FROM public.customers), 1), true);

-- Insert sample addresses
INSERT INTO addresses
    (id, address_line1, address_line2, address_line3, address_line4, postcode, country)
VALUES
    (1, '123 Main St', NULL, NULL, NULL, '10001', 'US'),
    (2, '456 Oak Ave', NULL, NULL, NULL, '20002', 'US'),
    (3, '789 Pine Rd', NULL, NULL, NULL, '30003', 'US'),
    (4, '321 Elm St', NULL, NULL, NULL, '40004', 'US'),
    (5, '654 Maple Ln', NULL, NULL, NULL, '50005', 'US');

SELECT setval(pg_get_serial_sequence('public.addresses','id'), COALESCE((SELECT MAX(id) FROM public.addresses), 1), true);

-- Map customers to addresses (customer_addresses)
INSERT INTO customer_addresses
    (id, customer_id, address_id, address_type)
VALUES
    (1, 1, 1, 'Billing'),
    (2, 1, 1, 'Shipping'),
    (3, 2, 2, 'Billing'),
    (4, 2, 2, 'Shipping'),
    (5, 3, 2, 'Billing'),
    (6, 3, 3, 'Shipping'),
    (7, 4, 4, 'Billing'),
    (8, 5, 5, 'Shipping');

SELECT setval(pg_get_serial_sequence('public.customer_addresses','id'), COALESCE((SELECT MAX(id) FROM public.customer_addresses), 1), true);