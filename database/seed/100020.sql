--liquibase formatted sql

--changeset user:00020
--comment: insert data into order statues table

INSERT INTO order_statuses
    (id, status_name, status_description)
VALUES
    (1, 'Pending', 'Order has been placed but not yet processed.'),
    (2, 'Processing', 'Order is currently being processed.'),
    (3, 'Shipped', 'Order has been shipped to the customer.'),
    (4, 'Delivered', 'Order has been delivered to the customer.'),
    (5, 'Cancelled', 'Order has been cancelled.'),
    (6, 'Returned', 'Order has been returned by the customer.');

SELECT setval(pg_get_serial_sequence('public.order_statuses','id'), COALESCE((SELECT MAX(id) FROM public.order_statuses), 1), true);

-- Insert sample products
INSERT INTO products
    (id, product_name, product_description)
VALUES
    (1, 'Wireless Mouse', 'Ergonomic wireless mouse with a sleek design'),
    (2, 'Bluetooth Headphones', 'Over-ear Bluetooth headphones with noise cancellation'),
    (3, 'Smartphone Case', 'Slim-fit protective case for smartphones'),
    (4, 'Laptop Sleeve', 'Padded sleeve to protect your laptop from scratches and bumps'),
    (5, 'Mechanical Keyboard', 'RGB backlit mechanical keyboard with custom switches');

SELECT setval(pg_get_serial_sequence('public.products','id'), COALESCE((SELECT MAX(id) FROM public.products), 1), true);

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
    (2, 2, 2, 'Billing'),
    (3, 3, 3, 'Billing'),
    (4, 4, 4, 'Billing'),
    (5, 5, 5, 'Billing');

SELECT setval(pg_get_serial_sequence('public.customer_addresses','id'), COALESCE((SELECT MAX(id) FROM public.customer_addresses), 1), true);

-- Insert sample order lines (one per order)
INSERT INTO order_lines
    (id, order_id, product_id, quantity, price, total)
VALUES
    (1, 1, 1, 1, 1.23, 1.23),
    (2, 2, 2, 1, 2.34, 2.34),
    (3, 3, 3, 1, 3.45, 3.45),
    (4, 4, 4, 1, 4.56, 4.56),
    (5, 5, 5, 1, 5.67, 5.67);

SELECT setval(pg_get_serial_sequence('public.orders','id'), COALESCE((SELECT MAX(id) FROM public.orders), 1), true);
SELECT setval(pg_get_serial_sequence('public.order_lines','id'), COALESCE((SELECT MAX(id) FROM public.order_lines), 1), true);
