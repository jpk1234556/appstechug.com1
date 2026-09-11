# Appstech International

React and Vite landing page with a Supabase-backed newsletter signup.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. In the Supabase dashboard, create a project and copy **Project URL** and the public **anon key** from Project Settings > API.

3. Copy `.env.example` to `.env` and replace the placeholders:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

4. In Supabase, open **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql), then start the app:

   ```bash
   npm run dev
   ```

The newsletter and order request forms connect to Supabase only when those environment variables are present. The browser only uses the Supabase anon key. Never put a Supabase service-role key in `.env` or frontend code.

## Create an admin account

1. In Supabase, open **Authentication → Users** and create the admin user with an email and password.
2. Copy that user's UUID.
3. In **SQL Editor**, promote the user:

   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE_AUTH_USER_UUID_HERE');
   ```

The `admin_users` table controls access. Admin RLS policies allow that user to view and update orders; regular users cannot read customer orders. Do not add admin status to frontend environment variables or user-editable metadata.

## GitHub and Vercel

1. Create a GitHub repository and push this project.
2. In Vercel, choose **New Project**, import the GitHub repository, and keep the framework as **Vite**.
3. Add these Vercel environment variables for the Production, Preview, and Development environments:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy. Vercel will use `npm run build` and publish the `dist` directory automatically.

Every push to the connected GitHub branch will create a new Vercel deployment.
