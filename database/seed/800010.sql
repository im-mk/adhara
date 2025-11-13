--liquibase formatted sql

--changeset user:80010
--comment: insert lookup data into countries and order statuses tables

-- Insert countries (ISO 3166-1 alpha-2 codes)
INSERT INTO countries (id, name)
VALUES
    ('US', 'United States'),
    ('GB', 'United Kingdom'),
    ('DE', 'Germany'),
    ('FR', 'France'),
    ('ES', 'Spain'),
    ('IT', 'Italy'),
    ('NL', 'Netherlands'),
    ('SE', 'Sweden'),
    ('NO', 'Norway'),
    ('JP', 'Japan');

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
