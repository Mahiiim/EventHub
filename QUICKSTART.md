# ⚡ EventHub — Quick Fix Guide

## The Error You're Seeing
```
Could not find the table 'public.event_requests' in the schema cache
```
This means the database tables don't exist yet (or RLS policies are blocking access).

---

## Fix in 3 Steps

### Step 1 — Run the SQL
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar  
3. Click **"+ New query"**
4. Open `supabase-setup.sql` from this project folder
5. **Select all** (Ctrl+A) and **paste** into the SQL Editor
6. Click **"Run"** (green button)
7. You should see: `events_count: 10` in the results ✅

### Step 2 — Make Your Account an Admin
After logging into the app with your account, run this in the SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```
Replace `your@email.com` with your actual email.

### Step 3 — Verify Your .env File
Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://yarxgijetwvqzklcwstz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tCplPK1ezzIVsV-pmO0xBw_2pteoIe_
```

---

## What Was Fixed in This Update

| Issue | Fix |
|-------|-----|
| `event_requests` table not found | Added `CREATE TABLE IF NOT EXISTS` for all 4 tables |
| Events not loading on Home/Events pages | Fixed `getAll()` to not pass `null` as status filter |
| Admin can't create events | Fixed RLS policy — previously checked wrong condition |
| Admin can't view all events | Added admin bypass in `events_select` policy |
| `getById` crashing | Separated participant count into own query |
| `maybeSingle()` vs `single()` | Changed profile lookup to `maybeSingle()` so it doesn't throw on empty |
| AuthContext infinite loading | Added `.finally()` to ensure loading state resolves even on RLS error |
| Request submission failing | Strip empty strings from payload before insert |

---

## Dummy Events Included
The SQL seeds **10 events** covering:
- 🖥️ ReactConf Dhaka 2026 (Technology)
- 💼 Startup Summit Bangladesh (Business)
- 📸 Photography Walk: Old Dhaka (Arts & Culture)
- 🤖 AI & Machine Learning Workshop (Technology)
- 🍜 Dhaka Food Festival (Food & Drink)
- 👩‍💻 Women in Tech Bangladesh (Technology)
- 🧘 Yoga & Mindfulness Retreat (Health & Wellness)
- 🎵 Indie Music Night (Music)
- 🔐 Cybersecurity Bootcamp (Technology)
- 🤝 Career Fair: Tech & Finance (Networking)

---

## Still Having Issues?

### "permission denied for table events"
Your user doesn't have the admin role yet. Run:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```
Then **log out and log back in** (the app checks role on login).

### "duplicate policy" errors when running SQL
That's fine — the script drops old policies first. If it still fails, run just the DROP section first, then run the full script again.

### Events show for admin but not for regular users
Check that the `events_select` policy allows `status = 'active'` rows. The SQL in this update fixes this.
