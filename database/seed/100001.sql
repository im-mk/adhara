--liquibase formatted sql

--changeset user:00001
--comment: insert data into order statues table

INSERT INTO order_statuses
    (status_name, status_description)
VALUES
    ('Pending', 'Order has been placed but not yet processed.'),
    ('Processing', 'Order is currently being processed.'),
    ('Shipped', 'Order has been shipped to the customer.'),
    ('Delivered', 'Order has been delivered to the customer.'),
    ('Cancelled', 'Order has been cancelled.'),
    ('Returned', 'Order has been returned by the customer.');

-- Insert sample products
INSERT INTO products
    (product_name, product_description, category_id, price, stock_quantity)
VALUES
    ('Wireless Mouse', 'Ergonomic wireless mouse with a sleek design', 1, 29.99, 150),
    ('Bluetooth Headphones', 'Over-ear Bluetooth headphones with noise cancellation', 2, 99.99, 80),
    ('Smartphone Case', 'Slim-fit protective case for smartphones', 3, 14.99, 200),
    ('Laptop Sleeve', 'Padded sleeve to protect your laptop from scratches and bumps', 3, 19.99, 120),
    ('Mechanical Keyboard', 'RGB backlit mechanical keyboard with custom switches', 1, 129.99, 50);


-- Insert sample customers
INSERT INTO customers
    (first_name, last_name)
VALUES
    ('John', 'Doe'),
    ('Jane', 'Smith'),
    ('Alice', 'Johnson'),
    ('Bob', 'Brown'),
    ('Charlie', 'Davis');

INSERT INTO orders
    (
    order_number, order_date, order_status_id, total_amount, currency, customer_id, payment_id, shipping_id, item_count, created_at, updated_at)
VALUES
    ('A00001', NOW(), 1, 1.23, 'GBP', 1, 1, 1, 1, NOW(), NOW());