# EventHub — Event Registration System

A full-stack event registration platform built with React + Supabase.

## Tech Stack
- **Frontend**: React 19, React Router 6, Tailwind CSS 3
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: Lucide React icons, DM Sans + Playfair Display fonts

## Features
- 🔐 Auth (register, login, logout, protected routes)
- 🎭 Role-based access: Guest / User / Admin
- 🗓️ Browse, search, and filter events
- ✅ Register for events with capacity tracking
- 📋 Submit event requests (pending admin approval)
- 🛠️ Full admin dashboard: events, requests, participants, users
- 🌙 Dark mode support
- 📱 Mobile-responsive layout
- 📤 CSV export for participants

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase-setup.sql`
3. Copy your project URL and anon key from **Settings → API**

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Create an Admin

After signing up, run in Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── AdminLayout.jsx
│   │   └── ProtectedRoute.jsx
│   └── ui/
│       ├── EventCard.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       ├── Skeleton.jsx
│       └── ConfirmDialog.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useTheme.js
├── pages/
│   ├── Home.jsx
│   ├── EventList.jsx
│   ├── EventDetail.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── RequestEvent.jsx
│   ├── MyRegistrations.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── AdminEvents.jsx
│       ├── AdminRequests.jsx
│       ├── AdminParticipants.jsx
│       └── AdminUsers.jsx
├── services/
│   ├── supabase.js
│   └── api.js
└── utils/
    └── helpers.js
```

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Home page with hero and event grid |
| `/events` | Public | Browse all events |
| `/events/:id` | Public | Event details + registration |
| `/login` | Guest | Sign in |
| `/register` | Guest | Create account |
| `/request-event` | User | Submit event request |
| `/my-registrations` | User | View registrations & requests |
| `/admin` | Admin | Dashboard overview |
| `/admin/events` | Admin | Manage events (CRUD) |
| `/admin/requests` | Admin | Approve/reject event requests |
| `/admin/participants` | Admin | View & manage participants |
| `/admin/users` | Admin | User list & role management |
