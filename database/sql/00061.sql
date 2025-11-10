--liquibase formatted sql

--changeset user:00061
--comment: Ensure sequences are set to max(id) after seed inserts to avoid duplicate key errors
SELECT setval(pg_get_serial_sequence('public.customers','id'), COALESCE((SELECT MAX(id) FROM public.customers), 1), true);
SELECT setval(pg_get_serial_sequence('public.products','id'), COALESCE((SELECT MAX(id) FROM public.products), 1), true);
SELECT setval(pg_get_serial_sequence('public.order_statuses','id'), COALESCE((SELECT MAX(id) FROM public.order_statuses), 1), true);

--rollback -- no-op
