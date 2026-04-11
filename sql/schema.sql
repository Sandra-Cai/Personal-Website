-- Run in Supabase SQL editor (or any Postgres) before enabling the API.

create table if not exists sandra_gpt_turns (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  client_turn_id text not null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create index if not exists sandra_gpt_turns_session_created_idx
  on sandra_gpt_turns (session_id, created_at asc);

create unique index if not exists sandra_gpt_turns_session_client_uidx
  on sandra_gpt_turns (session_id, client_turn_id);
