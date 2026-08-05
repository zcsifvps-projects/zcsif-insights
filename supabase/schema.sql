-- ZCSIF Engagement Tracker — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_type text not null default 'Workshop'
    check (event_type in ('Workshop','Conference','Meeting','Webinar','Community Outreach','Stakeholder Engagement','Other')),
  organizer text,
  partner_organization text,
  venue_type text default 'Physical' check (venue_type in ('Physical','Virtual','Hybrid')),
  location text,
  start_date date not null,
  end_date date,
  target_audience text,
  expected_participants integer,
  actual_participants integer,
  budget numeric,
  lead_person text,
  status text not null default 'Planned'
    check (status in ('Planned','Confirmed','Ongoing','Completed','Postponed','Cancelled')),
  objectives text,
  key_outcomes text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- trainings
-- ---------------------------------------------------------------------------
create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  training_title text not null,
  training_type text not null default 'Skills Building'
    check (training_type in ('Skills Building','Capacity Strengthening','Induction','Refresher','Training of Trainers (ToT)','Technical','Other')),
  facilitator text,
  partner_organization text,
  target_group text,
  delivery_mode text default 'In-person' check (delivery_mode in ('In-person','Online','Hybrid')),
  location text,
  start_date date not null,
  end_date date,
  expected_participants integer,
  actual_participants integer,
  male_participants integer,
  female_participants integer,
  certification_provided boolean not null default false,
  budget numeric,
  lead_person text,
  status text not null default 'Planned'
    check (status in ('Planned','Confirmed','Ongoing','Completed','Postponed','Cancelled')),
  learning_objectives text,
  key_outcomes text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- participants (attendance register — related_record points at events.id or trainings.id)
-- ---------------------------------------------------------------------------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  related_module text not null check (related_module in ('Events','Trainings')),
  related_record uuid not null,
  full_name text not null,
  organization text,
  designation text,
  gender text check (gender in ('Female','Male','Other','Prefer not to say')),
  contact_email text,
  contact_number text,
  attendance_status text not null default 'Registered'
    check (attendance_status in ('Registered','Attended','No-show','Cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_participants_related on participants (related_module, related_record);

-- ---------------------------------------------------------------------------
-- feedback (generic — related_record points at events.id or trainings.id)
-- ---------------------------------------------------------------------------
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  related_module text not null check (related_module in ('Events','Trainings')),
  related_record uuid not null,
  respondent_name text,
  respondent_type text default 'Participant'
    check (respondent_type in ('Participant','Partner','Beneficiary','Staff','Donor','Other')),
  feedback_date date not null default current_date,
  overall_rating integer check (overall_rating between 1 and 5),
  satisfaction_level text
    check (satisfaction_level in ('Very Satisfied','Satisfied','Neutral','Dissatisfied','Very Dissatisfied')),
  what_worked_well text,
  areas_for_improvement text,
  recommendations text,
  follow_up_required boolean not null default false,
  status text not null default 'New' check (status in ('New','Reviewed','Actioned')),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_related on feedback (related_module, related_record);

-- ---------------------------------------------------------------------------
-- updated_at trigger for events/trainings
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at before update on events
  for each row execute function set_updated_at();

drop trigger if exists trg_trainings_updated_at on trainings;
create trigger trg_trainings_updated_at before update on trainings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — any signed-in staff member (authenticated role) can
-- read and write everything. Good enough for a small internal team; tighten
-- later (e.g. per-user ownership) if ZCSIF needs finer-grained permissions.
-- ---------------------------------------------------------------------------
alter table events enable row level security;
alter table trainings enable row level security;
alter table participants enable row level security;
alter table feedback enable row level security;

drop policy if exists "authenticated full access" on events;
create policy "authenticated full access" on events
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on trainings;
create policy "authenticated full access" on trainings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on participants;
create policy "authenticated full access" on participants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on feedback;
create policy "authenticated full access" on feedback
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Public feedback links — anyone with a training/event link (no login) can
-- view its name/dates and submit ONE feedback entry. They cannot read
-- existing feedback, edit anything, or see any other table.
-- ---------------------------------------------------------------------------
drop policy if exists "anon read trainings for public link" on trainings;
create policy "anon read trainings for public link" on trainings
  for select to anon using (true);

drop policy if exists "anon read events for public link" on events;
create policy "anon read events for public link" on events
  for select to anon using (true);

drop policy if exists "anon submit feedback" on feedback;
create policy "anon submit feedback" on feedback
  for insert to anon with check (
    status = 'New' and follow_up_required = false and created_by is null
  );
