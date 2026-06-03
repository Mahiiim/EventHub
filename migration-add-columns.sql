-- ============================================================
-- EventHub — Migration: Add new columns
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add google_form_url and organizer info to events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS google_form_url    text,
  ADD COLUMN IF NOT EXISTS organizer_name     text,
  ADD COLUMN IF NOT EXISTS organizer_email    text;

-- Add extra participant info columns
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS phone        text,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS designation  text,
  ADD COLUMN IF NOT EXISTS message      text;

-- Add google_form_url to event_requests too (so admins can set it when approving)
ALTER TABLE public.event_requests
  ADD COLUMN IF NOT EXISTS google_form_url text;

-- Verify
SELECT
  column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('events', 'participants', 'event_requests')
  AND column_name IN ('google_form_url','organizer_name','organizer_email','phone','organization','designation','message')
ORDER BY table_name, column_name;
