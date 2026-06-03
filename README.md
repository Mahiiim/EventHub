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


### Install & Run

```bash
npm install
npm run dev
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
│   ├── Profile.jsx
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
