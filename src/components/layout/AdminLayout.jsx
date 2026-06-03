import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, ClipboardList, Users, UserCog, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import { useToast } from '../ui/Toast'
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/requests', label: 'Event Requests', icon: ClipboardList },
  { to: '/admin/participants', label: 'Participants', icon: Users },
  { to: '/admin/users', label: 'Users', icon: UserCog },
]

function SidebarContent({ pathname, setSidebarOpen, profile, handleLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 dark:text-white text-sm">EventHub</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to)
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {profile?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{profile?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors">
          <LogOut size={16} /><span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = async () => {
    await authService.signOut()
    toast('Logged out', 'success')
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shrink-0">
        <SidebarContent pathname={pathname} setSidebarOpen={setSidebarOpen} profile={profile} handleLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-gray-900 flex flex-col shadow-2xl">
            <SidebarContent pathname={pathname} setSidebarOpen={setSidebarOpen} profile={profile} handleLogout={handleLogout} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {navItems.find(n => n.exact ? pathname === n.to : pathname.startsWith(n.to))?.label || 'Admin'}
            </p>
          </div>
          <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View Site →</Link>
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
