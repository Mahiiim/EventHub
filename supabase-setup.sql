DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Drop old storage policies
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;


CREATE TABLE IF NOT EXISTS public.users (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       text,
  email      text UNIQUE,
  role       text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  description           text,
  category              text,
  location              text,
  event_date            timestamptz,
  organizer_name        text,
  organizer_email       text,
  image_url             text,
  capacity              int DEFAULT 100,
  registration_deadline date,
  status                text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes           text,
  submitted_by          uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  description           text,
  category              text,
  location              text,
  event_date            timestamptz,
  image_url             text,
  capacity              int NOT NULL DEFAULT 100,
  registration_deadline date,
  created_by            uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.participants (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id            uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  participant_name   text,
  participant_email  text,
  registration_date  timestamptz DEFAULT now(),
  attendance_status  text DEFAULT 'registered' CHECK (attendance_status IN ('registered','attended','no-show')),
  UNIQUE(event_id, user_id)
);


ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants  ENABLE ROW LEVEL SECURITY;


-- RLS POLICIES



CREATE POLICY "users_select_all"
  ON public.users FOR SELECT
  USING (true);

-- Any authenticated user can insert their own row
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own row; admins can update any
CREATE POLICY "users_update"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- EVENTS
-- Public can read active events; admins can read all
CREATE POLICY "events_select"
  ON public.events FOR SELECT
  USING (
    status = 'active'
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can create events
CREATE POLICY "events_insert"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update events
CREATE POLICY "events_update"
  ON public.events FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete events
CREATE POLICY "events_delete"
  ON public.events FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── EVENT REQUESTS ─────────────────────────────────────────
-- Authenticated users see their own requests; admins see all
CREATE POLICY "requests_select"
  ON public.event_requests FOR SELECT
  USING (
    auth.uid() = submitted_by
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Any authenticated user can submit a request
CREATE POLICY "requests_insert"
  ON public.event_requests FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- Admins can update (approve/reject) requests
CREATE POLICY "requests_update"
  ON public.event_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── PARTICIPANTS ────────────────────────────────────────────
-- Users see their own registrations; admins see all
CREATE POLICY "participants_select"
  ON public.participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Any authenticated user can register for an event
CREATE POLICY "participants_insert"
  ON public.participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User can delete their own; admins can delete any
CREATE POLICY "participants_delete"
  ON public.participants FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STEP 5: STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "storage_insert_authed"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

CREATE POLICY "storage_delete_authed"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- ============================================================
-- STEP 6: AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 7: SEED DUMMY EVENTS
-- ============================================================
-- Insert 10 realistic dummy events
INSERT INTO public.events (title, description, category, location, event_date, image_url, capacity, registration_deadline, status) VALUES

(
  'ReactConf Dhaka 2026',
  'Join us for a full-day conference covering the latest in React 19, Server Components, and the future of frontend development. Featuring 12 speakers from top tech companies, hands-on workshops, and networking opportunities with 500+ developers.',
  'Technology',
  'Bashundhara Convention City, Dhaka',
  '2026-07-15 09:00:00+06',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  500,
  '2026-07-10',
  'active'
),
(
  'Startup Summit Bangladesh 2026',
  'Bangladesh's biggest startup gathering returns! Connect with 200+ founders, investors, and mentors. Pitching competition with BDT 50 lakh prize pool, panel discussions on fundraising, and workshops on product-market fit.',
  'Business',
  'Pan Pacific Sonargaon Hotel, Dhaka',
  '2026-07-22 10:00:00+06',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
  300,
  '2026-07-18',
  'active'
),
(
  'Photography Walk: Old Dhaka',
  'Explore the hidden gems and vibrant street life of Old Dhaka through your lens. Led by award-winning photographer Rashed Hasan, this 4-hour guided walk covers Shakhari Bazaar, Lalbagh Fort, and the bustling riverbanks of Buriganga.',
  'Arts & Culture',
  'Sadarghat Launch Terminal, Dhaka',
  '2026-07-05 06:30:00+06',
  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
  30,
  '2026-07-03',
  'active'
),
(
  'AI & Machine Learning Workshop',
  'A 2-day intensive workshop for developers looking to break into AI. Topics: Python for ML, scikit-learn, deep learning with PyTorch, deploying models to production, and prompt engineering for LLMs. Laptops required.',
  'Technology',
  'BRAC University, Mohakhali, Dhaka',
  '2026-08-02 09:00:00+06',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  80,
  '2026-07-28',
  'active'
),
(
  'Dhaka Food Festival 2026',
  'A three-day celebration of Bangladeshi cuisine and international flavors. 60+ food stalls, live cooking demonstrations by celebrity chefs, folk music performances, and a dedicated street food competition. Family-friendly event with kids'' activities.',
  'Food & Drink',
  'Hatirjheel Amphitheater, Dhaka',
  '2026-08-08 11:00:00+06',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  2000,
  '2026-08-06',
  'active'
),
(
  'Women in Tech Bangladesh Conference',
  'Celebrating and empowering women in technology. Keynotes from leading women engineers and founders, mentorship sessions, resume workshops, and a job fair featuring 30+ companies actively hiring. Scholarships available for students.',
  'Technology',
  'ICT Tower, Agargaon, Dhaka',
  '2026-08-15 09:00:00+06',
  'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
  400,
  '2026-08-10',
  'active'
),
(
  'Yoga & Mindfulness Retreat',
  'Escape the city for a weekend of guided yoga, meditation, and breathwork in a serene lakeside setting. All experience levels welcome. Includes accommodation, vegetarian meals, and three daily sessions led by certified instructors.',
  'Health & Wellness',
  'Bhawal National Park, Gazipur',
  '2026-07-26 07:00:00+06',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  50,
  '2026-07-20',
  'active'
),
(
  'Indie Music Night: Dhaka Sessions',
  'An intimate evening showcasing Bangladesh''s best indie and alternative music acts. 8 bands performing across two stages, vinyl record market, art installations, and craft beverages. Proceeds support local music education programs.',
  'Music',
  'Alliance Française de Dhaka, Mirpur Road',
  '2026-07-19 18:00:00+06',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
  200,
  '2026-07-17',
  'active'
),
(
  'Cybersecurity Bootcamp: Ethical Hacking',
  'Learn penetration testing, vulnerability assessment, and defensive security from certified ethical hackers. 3-day intensive covering web app security, network scanning, CTF challenges, and preparing for CEH certification.',
  'Technology',
  'North South University, Bashundhara, Dhaka',
  '2026-09-05 09:00:00+06',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  60,
  '2026-09-01',
  'active'
),
(
  'Career Fair: Tech & Finance 2026',
  'Meet recruiters from 50+ leading companies in technology, banking, fintech, and consulting. Bring your resume for on-spot interviews, attend skill-building seminars, and connect with alumni mentors. Open to all graduates and experienced professionals.',
  'Networking',
  'Bangabandhu International Conference Center, Dhaka',
  '2026-08-20 10:00:00+06',
  'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80',
  1500,
  '2026-08-17',
  'active'
)

ON CONFLICT DO NOTHING;

-- ============================================================
-- STEP 8: MAKE YOURSELF AN ADMIN
-- ============================================================
-- After running this script, run the line below with YOUR email:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';

-- ============================================================
-- VERIFY: Check everything was created correctly
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM public.events)         AS events_count,
  (SELECT COUNT(*) FROM public.event_requests) AS requests_count,
  (SELECT COUNT(*) FROM public.users)          AS users_count,
  (SELECT COUNT(*) FROM public.participants)   AS participants_count;
