import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Eye, MessageSquare, RefreshCw } from 'lucide-react'
import { requestService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { formatDate, STATUS_COLORS } from '../../utils/helpers'

export default function AdminRequests() {
  const { profile } = useAuth()
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewing, setViewing] = useState(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(null)

  const load = () => {
    setLoading(true)
    requestService.getAll()
      .then(data => setRequests(data || []))
      .catch(err => { console.error('Load requests error:', err); toast('Failed to load requests: ' + err.message, 'error') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleApprove = async (req) => {
    setProcessing(req.id)
    try {
      await requestService.approveAndCreate({ ...req, admin_notes: notes || null }, profile.id)
      toast('✓ Request approved and event created!', 'success')
      setViewing(null)
      setNotes('')
      load()
    } catch (e) {
      console.error('Approve error:', e)
      toast(e.message || 'Failed to approve request', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (req) => {
    setProcessing(req.id)
    try {
      await requestService.updateStatus(req.id, 'rejected', notes || null)
      toast('Request rejected', 'info')
      setViewing(null)
      setNotes('')
      load()
    } catch (e) {
      console.error('Reject error:', e)
      toast(e.message || 'Failed to reject request', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Event Requests</h1>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all','pending','approved','rejected']).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'bg-brand-600 text-white' : 'btn-secondary'}`}>
            {f} <span className="ml-1 opacity-75">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                {['Title','Organizer','Category','Event Date','Submitted','Status','Actions'].map(h =>
                  <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    No {filter !== 'all' ? filter : ''} requests found
                  </td>
                </tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">
                    <div className="max-w-[180px] truncate">{req.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{req.organizer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{req.category || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(req.event_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(req.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[req.status] || ''}`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setViewing(req); setNotes(req.admin_notes || '') }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setViewing(req); setNotes('') }}
                            disabled={processing === req.id}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            disabled={processing === req.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            Showing {filtered.length} of {requests.length} requests
          </div>
        )}
      </div>

      {/* Detail / Action Modal */}
      <Modal isOpen={!!viewing} onClose={() => { setViewing(null); setNotes('') }} title="Request Details" size="lg">
        {viewing && (
          <div className="space-y-5">
            {viewing.image_url && (
              <img src={viewing.image_url} alt="" className="w-full h-48 object-cover rounded-xl"
                onError={e => { e.target.style.display='none' }} />
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                ['Title', viewing.title],
                ['Category', viewing.category || '—'],
                ['Location', viewing.location || '—'],
                ['Event Date', formatDate(viewing.event_date)],
                ['Organizer Name', viewing.organizer_name],
                ['Organizer Email', viewing.organizer_email],
                ['Capacity', viewing.capacity || 100],
                ['Status', viewing.status],
                ['Submitted', formatDate(viewing.created_at)],
                ['Registration Deadline', formatDate(viewing.registration_deadline) || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{k}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{v}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
                <p className="text-gray-600 dark:text-gray-300">{viewing.description || '—'}</p>
              </div>
            </div>

            {viewing.admin_notes && viewing.status !== 'pending' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-600 font-medium mb-0.5">Admin Notes</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{viewing.admin_notes}</p>
              </div>
            )}

            {viewing.status === 'pending' && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={14} />Admin Notes (optional — sent to organizer)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add feedback or notes for the organizer..."
                  className="input-field resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(viewing)}
                    disabled={!!processing}
                    className="btn-primary flex items-center gap-2 flex-1 justify-center py-2.5"
                  >
                    {processing === viewing.id
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <CheckCircle size={16} />
                    }
                    Approve & Create Event
                  </button>
                  <button
                    onClick={() => handleReject(viewing)}
                    disabled={!!processing}
                    className="btn-danger flex items-center gap-2 flex-1 justify-center py-2.5"
                  >
                    <XCircle size={16} />Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
