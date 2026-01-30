-- 1. Drop existing table if any
DROP TABLE IF EXISTS public.alerts CASCADE;

-- 2. Create alerts table
CREATE TABLE public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    target_price NUMERIC NOT NULL,
    enabled BOOLEAN DEFAULT true,
    triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    triggered_at TIMESTAMPTZ,
    
    -- Constraint to ensure target price is positive
    CONSTRAINT alerts_target_price_check CHECK (target_price > 0),
    -- Constraint to ensure one alert per product per user prevents duplicates
    CONSTRAINT alerts_user_product_unique UNIQUE (user_id, product_id)
);

-- Index for faster lookups during scraping/checking
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_product_id ON public.alerts(product_id);

-- 3. Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Policy: Users can read only their own alerts
CREATE POLICY "Users can read own alerts" 
ON public.alerts FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert alerts only for themselves
CREATE POLICY "Users can insert own alerts" 
ON public.alerts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own alerts
CREATE POLICY "Users can update own alerts" 
ON public.alerts FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete only their own alerts
CREATE POLICY "Users can delete own alerts" 
ON public.alerts FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Example Operations

-- A. Insert a new alert
-- INSERT INTO public.alerts (user_id, product_id, target_price)
-- VALUES ('user_uuid', 'product_uuid', 100.00);

-- B. Update alert as triggered (Server-side Logic usually, but user can see it)
-- UPDATE public.alerts 
-- SET triggered = true, triggered_at = now() 
-- WHERE id = 'alert_uuid' AND triggered = false;

-- C. Disable an alert
-- UPDATE public.alerts 
-- SET enabled = false 
-- WHERE id = 'alert_uuid';

/* 
6. Explanation & Best Practices

- Why user_id is required: RLS relies on the `user_id` column to verify ownership. 
  Implicit relation via `product_id -> product -> user_id` is risky if products are shared later.
  Direct linking ensures strictly private alerts.

- Why check alerts Server-Side: Client-side checks only work when the user is online. 
  A cron job or Edge Function (like `scrape-product`) ensures alerts fire 24/7 even if the user is asleep.

- Why separate table: 
  1. Separation of Concerns: Products are data; Alerts are user preferences.
  2. Scalability: If multiple users track the same product URL, they share one `product` row 
     but have individual `alert` rows with different target prices.
*/
