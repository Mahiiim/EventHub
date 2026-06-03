import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Sun, Moon, LogOut, User, LayoutDashboard, Calendar, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../ui/Toast'

export default function Navbar() {
  const { user, profile, isAdmin } = useAuth()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = async () => {
    await authService.signOut()
    toast('Logged out successfully', 'success')
    navigate('/')
    setUserMenuOpen(false)
  }

  const avatarUrl = profile?.avatar_url

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">EventHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Browse Events</Link>
            {user && <Link to="/request-event" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Submit Event</Link>}
            {user && <Link to="/my-registrations" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">My Events</Link>}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center ring-2 ring-brand-200 dark:ring-brand-800">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-white text-sm font-semibold">{profile?.name?.[0]?.toUpperCase() || 'U'}</span>
                    }
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{profile?.name}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 card shadow-xl border border-gray-100 dark:border-gray-800 py-1 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center shrink-0">
                          {avatarUrl
                            ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            : <span className="text-white font-semibold">{profile?.name?.[0]?.toUpperCase() || 'U'}</span>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
                          {isAdmin && <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mt-0.5">Admin</span>}
                        </div>
                      </div>

                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <LayoutDashboard size={16} /><span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link to="/my-registrations" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Calendar size={16} /><span>My Events</span>
                      </Link>

                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <User size={16} /><span>Edit Profile</span>
                      </Link>

                      <Link to="/profile?tab=password" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Settings size={16} /><span>Account Settings</span>
                      </Link>

                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut size={16} /><span>Log out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Log in</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Sign up</Link>
              </div>
            )}

            <button className="md:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1">
            <Link to="/events" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Browse Events</Link>
            {user && <Link to="/request-event" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Submit Event</Link>}
            {user && <Link to="/my-registrations" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">My Events</Link>}
            {user && <Link to="/profile" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Edit Profile</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-xl">Admin Dashboard</Link>}
            {user && (
              <button onClick={handleLogout} className="text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                Log out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}