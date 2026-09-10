# Appstech International

React and Vite landing page with a Supabase-backed newsletter signup.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add the Supabase project URL and anon key.

3. In Supabase, open **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql), then start the app:

   ```bash
   npm run dev
   ```

The browser only uses the Supabase anon key. Never put a Supabase service-role key in `.env` or frontend code.

## GitHub and Vercel

1. Create a GitHub repository and push this project.
2. In Vercel, choose **New Project**, import the GitHub repository, and keep the framework as **Vite**.
3. Add these Vercel environment variables for the Production, Preview, and Development environments:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy. Vercel will use `npm run build` and publish the `dist` directory automatically.

Every push to the connected GitHub branch will create a new Vercel deployment.
