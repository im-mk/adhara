--liquibase formatted sql

--changeset user:90020
--comment: insert bulk products, orders, addresses, and random order lines for pagination/load testing

-- 1️⃣ Add 200 products used by generated order lines
INSERT INTO public.products
    (id, product_name, product_description, unit_price)
SELECT
    900000 + gs,
    CONCAT('Bulk Product ', gs),
    CONCAT('Generated seed product ', gs),
    ROUND(10 + (gs * 0.75), 2)
FROM generate_series(1, 200) AS gs
ON CONFLICT (id) DO NOTHING;

-- 2️⃣ Shipping addresses for generated orders
INSERT INTO public.addresses
    (id, address_line1, address_line2, address_line3, address_line4, postcode, country)
SELECT
    700000 + gs,
    CONCAT(gs, ' Fulfillment Road'),
    'Order District',
    NULL,
    NULL,
    LPAD(gs::text, 5, '0'),
    'GB'
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- 3️⃣ Billing addresses for generated orders
INSERT INTO public.addresses
    (id, address_line1, address_line2, address_line3, address_line4, postcode, country)
SELECT
    710000 + gs,
    CONCAT(gs, ' Accounts Lane'),
    'Billing District',
    NULL,
    NULL,
    LPAD((gs + 10000)::text, 5, '0'),
    'GB'
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

-- 4️⃣ Insert 100,000 orders mapped to 10,000 customers
INSERT INTO public.orders
    (id, order_number, order_date, order_status_id, total_amount, customer_id, customer_name, shipping_address_id, billing_address_id)
SELECT
    800000 + gs,
    CONCAT('BULK-', LPAD(gs::text, 6, '0')),
    NOW() - ((gs % 365) * INTERVAL '1 day'),
    ((gs - 1) % 6) + 1,
    ROUND(
        (10 + ((((gs - 1) % 200) + 1) * 0.75)) *
        (((gs - 1) % 5) + 1),
        2
    ),
    100000 + ((gs - 1) % 10000) + 1,
    CONCAT('BulkFirst', ((gs - 1) % 10000) + 1, ' BulkLast', ((gs - 1) % 10000) + 1),
    700000 + ((gs - 1) % 10000) + 1,
    710000 + ((gs - 1) % 10000) + 1
FROM generate_series(1, 100000) AS gs
ON CONFLICT (id) DO NOTHING;

-- 5️⃣ Insert 1–5 random order lines per order
INSERT INTO public.order_lines
    (id, order_id, product_id, quantity, price, total)
SELECT
    900000 + row_number() OVER (),                         -- unique ID per order line
    o.id AS order_id,
    900000 + ((floor(random() * 200)::int) + 1) AS product_id,
    ((floor(random() * 5)::int) + 1) AS quantity,
    ROUND(10 + ((floor(random() * 200)::int + 1) * 0.75), 2) AS price,
    ROUND(
        (10 + ((floor(random() * 200)::int + 1) * 0.75)) *
        ((floor(random() * 5)::int) + 1),
        2
    ) AS total
FROM public.orders o,
     generate_series(1,5) gs
WHERE gs <= ((floor(random() * 5)::int) + 1)
;

-- 6️⃣ Keep sequences aligned for future inserts
SELECT setval(pg_get_serial_sequence('public.products', 'id'), COALESCE((SELECT MAX(id) FROM public.products), 1), true);
SELECT setval(pg_get_serial_sequence('public.addresses', 'id'), COALESCE((SELECT MAX(id) FROM public.addresses), 1), true);
SELECT setval(pg_get_serial_sequence('public.orders', 'id'), COALESCE((SELECT MAX(id) FROM public.orders), 1), true);
SELECT setval(pg_get_serial_sequence('public.order_lines', 'id'), COALESCE((SELECT MAX(id) FROM public.order_lines), 1), true);