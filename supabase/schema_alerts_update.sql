-- Add 'read' column to alerts table
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- Create Notifications Page logic or just query alerts with triggered=true
-- We can add a function to mark alerts as read if needed, but direct update is fine.
