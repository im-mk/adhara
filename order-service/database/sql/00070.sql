--liquibase formatted sql

--changeset user:00070
--comment: outbox_events table have event sourcing records.

CREATE TABLE IF NOT EXISTS public.outbox_events (
    id Serial not null,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(200) NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ NULL,
    CONSTRAINT pk_outbox_events_id PRIMARY KEY (id)
);


--rollback DROP TABLE IF EXISTS public.outbox_events;