--liquibase formatted sql

--changeset user:00001
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

-- Insert sample products
INSERT INTO products
    (id, product_name, product_description)
VALUES
    (1, 'Wireless Mouse', 'Ergonomic wireless mouse with a sleek design'),
    (2, 'Bluetooth Headphones', 'Over-ear Bluetooth headphones with noise cancellation'),
    (3, 'Smartphone Case', 'Slim-fit protective case for smartphones'),
    (4, 'Laptop Sleeve', 'Padded sleeve to protect your laptop from scratches and bumps'),
    (5, 'Mechanical Keyboard', 'RGB backlit mechanical keyboard with custom switches');


-- Insert sample customers
INSERT INTO customers
    (id, first_name, last_name)
VALUES
    (1, 'John', 'Doe'),
    (2, 'Jane', 'Smith'),
    (3, 'Alice', 'Johnson'),
    (4, 'Bob', 'Brown'),
    (5, 'Charlie', 'Davis');

INSERT INTO orders
    (
    order_number, order_date, order_status_id, total_amount, customer_id)
VALUES
    ('A00001', NOW(), 1, 1.23, 1),
    ('A00002', NOW(), 2, 2.34, 2),
    ('A00003', NOW(), 3, 3.45, 3),
    ('A00004', NOW(), 4, 4.56, 4),
    ('A00005', NOW(), 5, 5.67, 5);
    