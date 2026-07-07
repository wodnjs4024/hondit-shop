# Admin Setup

Admin pages are available at:

```text
https://hondit-shop.vercel.app/admin/login
```

Setup:

1. Create a Supabase project.
2. Run `supabase/migrations/001_bulk_order_schema.sql` in Supabase SQL editor.
3. Run `supabase/seed_bulk_products.sql`.
4. In Supabase Authentication, create an email/password user for the hondit admin.
5. Copy that user's UUID.
6. Run this SQL, replacing the values:

```sql
insert into public.admin_profiles (user_id, email, role)
values ('USER_UUID_HERE', 'admin@example.com', 'admin')
on conflict (user_id) do update set email = excluded.email, role = excluded.role;
```

7. Add Supabase environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
8. Redeploy.

Only emails listed in `admin_profiles` can enter the admin dashboard.
