-- The 'read' column is missing from your alerts table, which causes the application error.
-- Please run this command in your Supabase SQL Editor to fix it.

ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
