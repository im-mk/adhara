--liquibase formatted sql

--changeset user:90020
--comment: insert bulk customers and related addresses for pagination/load testing

-- 10,000 customers with deterministic ids so the seed can be re-run safely.
INSERT INTO public.customers
    (id, first_name, last_name)
SELECT
    100000 + gs,
    CONCAT('BulkFirst', gs),
    CONCAT('BulkLast', gs)
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- Billing addresses.
INSERT INTO public.addresses
    (id, address_line1, address_line2, address_line3, address_line4, postcode, country)
SELECT
    200000 + gs,
    CONCAT(gs, ' Billing Street'),
    'District A',
    NULL,
    NULL,
    LPAD(gs::text, 5, '0'),
    'GB'
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- Shipping addresses.
INSERT INTO public.addresses
    (id, address_line1, address_line2, address_line3, address_line4, postcode, country)
SELECT
    300000 + gs,
    CONCAT(gs, ' Shipping Avenue'),
    'District B',
    NULL,
    NULL,
    LPAD((gs + 10000)::text, 5, '0'),
    'GB'
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- Link billing addresses.
INSERT INTO public.customer_addresses
    (id, customer_id, address_id, address_type)
SELECT
    400000 + gs,
    100000 + gs,
    200000 + gs,
    'billing'
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- Link shipping addresses.
INSERT INTO public.customer_addresses
    (id, customer_id, address_id, address_type)
SELECT
    500000 + gs,
    100000 + gs,
    300000 + gs,
    'shipping'
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- Keep sequences aligned for future inserts without explicit ids.
SELECT setval(pg_get_serial_sequence('public.customers', 'id'), COALESCE((SELECT MAX(id) FROM public.customers), 1), true);
SELECT setval(pg_get_serial_sequence('public.addresses', 'id'), COALESCE((SELECT MAX(id) FROM public.addresses), 1), true);
SELECT setval(pg_get_serial_sequence('public.customer_addresses', 'id'), COALESCE((SELECT MAX(id) FROM public.customer_addresses), 1), true);
