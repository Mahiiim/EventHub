import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { eventService, storageService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDate, STATUS_COLORS, CATEGORIES } from '../../utils/helpers'

const BLANK = {
  title: '', description: '', category: '', location: '',
  event_date: '', image_url: '', capacity: 100,
  registration_deadline: '', status: 'active',
  organizer_name: '', organizer_email: '', google_form_url: ''
}

export default function AdminEvents() {
  const { profile } = useAuth()
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const load = () => {
    setLoading(true)
    eventService.getAll()
      .then(data => setEvents(data || []))
      .catch(err => toast('Failed to load events: ' + err.message, 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(BLANK)
    setImageFile(null)
    setModalOpen(true)
  }
  const openEdit = (e) => {
    setEditing(e)
    setForm({
      ...e,
      event_date: e.event_date?.slice(0, 16) || '',
      registration_deadline: e.registration_deadline?.slice(0, 10) || '',
      organizer_name: e.organizer_name || '',
      organizer_email: e.organizer_email || '',
      google_form_url: e.google_form_url || '',
    })
    setImageFile(null)
    setModalOpen(true)
  }

  const handleSave = async (ev) => {
    ev.preventDefault()
    setSaving(true)
    try {
      let image_url = form.image_url || null
      if (imageFile) image_url = await storageService.uploadEventImage(imageFile)
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        event_date: form.event_date,
        status: form.status,
        image_url,
        created_by: editing ? (form.created_by || profile?.id) : profile?.id,
        capacity: parseInt(form.capacity) || 100,
        registration_deadline: form.registration_deadline || null,
        organizer_name: form.organizer_name || null,
        organizer_email: form.organizer_email || null,
        google_form_url: form.google_form_url || null,
      }
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k] })

      if (editing) {
        await eventService.update(editing.id, payload)
        toast('Event updated', 'success')
      } else {
        await eventService.create(payload)
        toast('Event created', 'success')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      toast(e.message || 'Failed to save event', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try { await eventService.delete(deleteId); toast('Event deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
    finally { setDeleteId(null) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const filtered = events.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />New Event
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="input-field pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                {['Title','Category','Date','Capacity','Form','Status','Actions'].map(h =>
                  <th key={h} className="px-4 py-3">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No events yet — create one!</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">
                    <div className="truncate max-w-[180px]">{e.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{e.category || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(e.event_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{e.capacity}</td>
                  <td className="px-4 py-3 text-sm">
                    {e.google_form_url
                      ? <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">✓ Set</span>
                      : <span className="badge bg-gray-100 text-gray-400">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[e.status] || ''}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</div>}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Create New Event'} size="lg">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2">Event Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Event title" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the event..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Venue address" className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Date & Time *</label>
                <input required type="datetime-local" value={form.event_date} onChange={e => set('event_date', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label>
                <input type="date" value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2">Event Image</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://images.unsplash.com/..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Or upload a file:</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
              {imageFile && <p className="text-xs text-brand-600 mt-1">Selected: {imageFile.name}</p>}
            </div>
          </div>

          {/* Organizer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2">Organizer Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organizer Name</label>
                <input value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} placeholder="Name or organization" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organizer Email</label>
                <input type="email" value={form.organizer_email} onChange={e => set('organizer_email', e.target.value)} placeholder="organizer@email.com" className="input-field" />
              </div>
            </div>
          </div>

          {/* Google Form */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2">Registration Form</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Form URL</label>
              <input
                type="url"
                value={form.google_form_url}
                onChange={e => set('google_form_url', e.target.value)}
                placeholder="https://docs.google.com/forms/d/..."
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                After users fill in their info, they'll be redirected to this Google Form to complete registration. Leave blank if not needed.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Event" message="Delete this event? All participant registrations will also be removed. This cannot be undone." danger />
    </div>
  )
}
