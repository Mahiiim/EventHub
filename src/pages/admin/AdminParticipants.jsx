import { useEffect, useState } from 'react'
import { Search, Trash2, Download } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { participantService } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDate, exportCSV } from '../../utils/helpers'

export default function AdminParticipants() {
  const toast = useToast()
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('participants').select('*, events(title, event_date)').order('registration_date', { ascending: false })
      setParticipants(data || [])
    } catch { }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    try { await participantService.remove(deleteId); toast('Participant removed', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  const filtered = participants.filter(p =>
    p.participant_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.participant_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.events?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Participants</h1>
        <button onClick={() => exportCSV(filtered.map(p => ({
          name: p.participant_name, email: p.participant_email,
          event: p.events?.title, date: formatDate(p.registration_date)
        })), 'participants')} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={15} />Export CSV
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search participants..." className="input-field pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                {['Name','Email','Event','Event Date','Registered','Actions'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No participants found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">{p.participant_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.participant_email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-48 truncate">{p.events?.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(p.events?.event_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(p.registration_date)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">{filtered.length} participants</div>}
      </div>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Participant" message="Remove this participant from the event?" danger />
    </div>
  )
}
