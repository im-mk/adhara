--liquibase formatted sql

--changeset user:90010
--comment: insert sample data data

-- Insert sample products
INSERT INTO products
    (id, product_name, product_description, unit_price)
VALUES
    (1, 'Wireless Mouse', 'Ergonomic wireless mouse with a sleek design', 19.99),
    (2, 'Bluetooth Headphones', 'Over-ear Bluetooth headphones with noise cancellation', 59.99),
    (3, 'Smartphone Case', 'Slim-fit protective case for smartphones', 12.49),
    (4, 'Laptop Sleeve', 'Padded sleeve to protect your laptop from scratches and bumps', 25.00),
    (5, 'Mechanical Keyboard', 'RGB backlit mechanical keyboard with custom switches', 89.99);

SELECT setval(pg_get_serial_sequence('public.products','id'), COALESCE((SELECT MAX(id) FROM public.products), 1), true);


-- Insert sample orders
INSERT INTO orders
    (
    order_number, order_date, order_status_id, total_amount, customer_id)
VALUES
    ('A00001', NOW(), 1, 1.23, 1),
    ('A00002', NOW(), 2, 2.34, 2),
    ('A00003', NOW(), 3, 3.45, 3),
    ('A00004', NOW(), 4, 4.56, 4),
    ('A00005', NOW(), 5, 5.67, 5);

SELECT setval(pg_get_serial_sequence('public.orders','id'), COALESCE((SELECT MAX(id) FROM public.orders), 1), true);

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

-- Insert sample order lines (one per order)
INSERT INTO order_lines
    (id, order_id, product_id, quantity, price, total)
VALUES
    (1, 1, 1, 1, 1.23, 1.23),
    (2, 2, 2, 1, 2.34, 2.34),
    (3, 3, 3, 1, 3.45, 3.45),
    (4, 4, 4, 1, 4.56, 4.56),
    (5, 5, 5, 1, 5.67, 5.67);

SELECT setval(pg_get_serial_sequence('public.order_lines','id'), COALESCE((SELECT MAX(id) FROM public.order_lines), 1), true);
