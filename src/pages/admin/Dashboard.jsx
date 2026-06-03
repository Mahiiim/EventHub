import { useEffect, useState } from 'react'
import { Calendar, Users, ClipboardList, UserCog, TrendingUp, RefreshCw } from 'lucide-react'
import { statsService } from '../../services/api'
import { timeAgo } from '../../utils/helpers'

function StatCard({ icon: Icon, label, value, color, loading }) {
  if (loading) return (
    <div className="card p-6"><div className="skeleton h-16 rounded" /></div>
  )
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value ?? '—'}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    statsService.getOverview()
      .then(setStats)
      .catch(err => { console.error('Dashboard stats error:', err); setError(err.message) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const cards = [
    { label: 'Total Events', value: stats?.totalEvents, icon: Calendar, color: 'bg-brand-600' },
    { label: 'Total Participants', value: stats?.totalParticipants, icon: Users, color: 'bg-emerald-600' },
    { label: 'Pending Requests', value: stats?.pendingRequests, icon: ClipboardList, color: 'bg-amber-500' },
    { label: 'Registered Users', value: stats?.totalUsers, icon: UserCog, color: 'bg-purple-600' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overview of your event platform</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <strong>Error loading stats:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(c => <StatCard key={c.label} {...c} loading={loading} />)}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={20} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Registrations</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
          </div>
        ) : stats?.recentRegistrations?.length ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentRegistrations.map((r, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 text-sm font-semibold shrink-0">
                    {r.participant_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.participant_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">registered for <em>{r.events?.title}</em></p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{timeAgo(r.registration_date)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Users size={32} className="mx-auto text-gray-200 dark:text-gray-700 mb-2" />
            <p className="text-gray-400 text-sm">No registrations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
