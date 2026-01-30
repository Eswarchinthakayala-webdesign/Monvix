
2.  **Deploy Edge Function**:
    Since you have the `schema.sql` and the `supabase/functions/scrape-product` code, you need to deploy this to your Supabase project.
    
    Run these commands in your terminal (ensure Supabase CLI is installed):
    ```bash
    supabase login
    supabase link --project-ref <your-project-ref>
    supabase functions deploy scrape-product --no-verify-jwt
    supabase secrets set FIRECRAWL_API_KEY=fc_...
    ```
    *(Replace `<your-project-ref>` and `fc_...` with your actual values)*

3.  **Database Setup**:
    Run the SQL metadata provided in the first response to create the tables if you haven't already.
