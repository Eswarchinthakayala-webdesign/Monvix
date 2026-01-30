-- 1. Create the scrape_logs table
CREATE TABLE IF NOT EXISTS public.scrape_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    success BOOLEAN NOT NULL,
    price NUMERIC,
    currency WITH TIME ZONE, -- Mistake in my thought process? No, currency is TEXT usually.
    title TEXT,
    image_url TEXT,
    error_message TEXT,
    raw_response JSONB,
    
    CONSTRAINT scrape_logs_price_check CHECK (price >= 0)
);

-- Fix currency column type
ALTER TABLE public.scrape_logs DROP COLUMN IF EXISTS currency;
ALTER TABLE public.scrape_logs ADD COLUMN currency TEXT DEFAULT 'USD';

-- 2. Enable Row Level Security
ALTER TABLE public.scrape_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Users can view logs for their own products
CREATE POLICY "Users can view logs for their own products" 
ON public.scrape_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.products p 
        WHERE p.id = public.scrape_logs.product_id 
        AND p.user_id = auth.uid()
    )
);

-- Policy: Users can insert logs for their own products (required for client-side logging)
CREATE POLICY "Users can insert logs for their own products" 
ON public.scrape_logs 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.products p 
        WHERE p.id = public.scrape_logs.product_id 
        AND p.user_id = auth.uid()
    )
);

-- Note: No Update or Delete policies are created, making this effectively append-only for standard users.

-- 4. Create Index for faster queries
CREATE INDEX IF NOT EXISTS idx_scrape_logs_product_id ON public.scrape_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_attempted_at ON public.scrape_logs(attempted_at DESC);
