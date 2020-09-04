CREATE SCHEMA IF NOT EXISTS "travelperk_integration";

CREATE TABLE IF NOT EXISTS "access_tokens" (
    "account_id" text PRIMARY KEY NOT NULL,
    "token_set" jsonb NOT NULL,
    "created_at" timestamp without time zone DEFAULT NOW() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT NOW() NOT NULL
);
