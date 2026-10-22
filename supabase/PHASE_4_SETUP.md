# Phase 4 setup: create the first admin

This project uses Supabase for login and database access. The website's publishable key is public by design; database policies decide who may change data.

## 1. Apply the migrations

Apply the migrations in `supabase/migrations/` to the same Supabase project used by `supabase-config.js`, in filename order. Use the connected Supabase MCP or the Supabase SQL Editor.

The phase access migration keeps course phases readable by visitors and allows only users listed in `public.admin_users` to add or edit phases. It deliberately does not grant delete access. The next migration removes browser roles' permission to call `public.rls_auto_enable()`, a `SECURITY DEFINER` helper flagged by Supabase Security Advisor. It safely does nothing if that function is absent.

## 2. Create the admin login

In Supabase, open **Authentication → Users → Add user** and create the owner's email and password. For this class exercise, enable **Auto Confirm User** for the test account, as described in the Aula 4 material.

Do not add a public sign-up form to the site. A person who can sign in still cannot edit unless their user ID is explicitly registered as an admin.

## 3. Register that user as an admin

In the SQL Editor, replace the example email with the exact email used above, then run:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('YOUR_EMAIL_HERE')
on conflict (user_id) do nothing;
```

Check that one row was added:

```sql
select user_id, created_at
from public.admin_users;
```

Keep this table limited to the people allowed to edit the course.

## 4. Allow password-reset links to return to the site

In **Authentication → URL Configuration → Redirect URLs**, add:

```
https://katherineuchoas.github.io/vibe-coding-class/admin.html
```

## 5. Use the admin page

Open `https://katherineuchoas.github.io/vibe-coding-class/admin.html`, sign in, and add or edit a phase. The public page remains available to everyone.

## Manual security checks

- A visitor can still read the four public phases.
- A signed-out visitor cannot edit phases.
- A signed-in user who is not listed in `admin_users` cannot edit phases.
- The registered admin can add and edit phases.
- Browser roles cannot execute `public.rls_auto_enable()` directly.
- No secret or `service_role` key is present in browser files.
