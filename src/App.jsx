import AuthConfirm from './pages/AuthConfirm'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import Navbar from './components/layout/Navbar'
import AdminLayout from './components/layout/AdminLayout'
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute'

import Home from './pages/Home'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import RequestEvent from './pages/RequestEvent'
import MyRegistrations from './pages/MyRegistrations'
import Profile from './pages/Profile'

import Dashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/AdminEvents'
import AdminRequests from './pages/admin/AdminRequests'
import AdminParticipants from './pages/admin/AdminParticipants'
import AdminUsers from './pages/admin/AdminUsers'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventList /></PublicLayout>} />
            <Route path="/events/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/auth/confirm" element={<PublicLayout><AuthConfirm /></PublicLayout>} />

            <Route path="/request-event" element={<PublicLayout><ProtectedRoute><RequestEvent /></ProtectedRoute></PublicLayout>} />
            <Route path="/my-registrations" element={<PublicLayout><ProtectedRoute><MyRegistrations /></ProtectedRoute></PublicLayout>} />
            <Route path="/profile" element={<PublicLayout><ProtectedRoute><Profile /></ProtectedRoute></PublicLayout>} />

            <Route path="/admin" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminLayout><AdminEvents /></AdminLayout></AdminRoute>} />
            <Route path="/admin/requests" element={<AdminRoute><AdminLayout><AdminRequests /></AdminLayout></AdminRoute>} />
            <Route path="/admin/participants" element={<AdminRoute><AdminLayout><AdminParticipants /></AdminLayout></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}