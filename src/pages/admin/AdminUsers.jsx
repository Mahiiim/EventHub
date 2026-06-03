import { useEffect, useState } from 'react'
import { Shield, ShieldOff, Search } from 'lucide-react'
import { userService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { formatDate } from '../../utils/helpers'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function AdminUsers() {
  const { profile: me } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = () => { setLoading(true); userService.getAllUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleRoleChange = async () => {
    const { id, newRole } = confirm
    try {
      await userService.updateRole(id, newRole)
      toast(`User role updated to ${newRole}`, 'success')
      load()
    } catch (e) { toast(e.message, 'error') }
    finally { setConfirm(null) }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Users</h1>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                {['User','Email','Role','Joined','Actions'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{u.name}</span>
                      {u.id === me?.id && <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">You</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {u.id !== me?.id && (
                      <button
                        onClick={() => setConfirm({ id: u.id, name: u.name, newRole: u.role === 'admin' ? 'user' : 'admin' })}
                        className={`p-1.5 rounded-lg transition-colors ${u.role === 'admin' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600'}`}
                        title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                        {u.role === 'admin' ? <ShieldOff size={15} /> : <Shield size={15} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">{filtered.length} users</div>}
      </div>

      {confirm && (
        <ConfirmDialog isOpen onClose={() => setConfirm(null)} onConfirm={handleRoleChange}
          title="Change User Role"
          message={`Make ${confirm.name} ${confirm.newRole === 'admin' ? 'an admin' : 'a regular user'}?`}
          danger={confirm.newRole !== 'admin'} />
      )}
    </div>
  )
}
