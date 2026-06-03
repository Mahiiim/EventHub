import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Send, Upload, ArrowLeft, Home, ExternalLink } from 'lucide-react'
import { requestService, storageService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { CATEGORIES } from '../utils/helpers'

export default function RequestEvent() {
  const { user, profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    event_date: '',
    organizer_name: profile?.name || '',
    organizer_email: profile?.email || '',
    capacity: 100,
    registration_deadline: '',
    google_form_url: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let image_url = null
      if (imageFile) image_url = await storageService.uploadEventImage(imageFile)
      await requestService.create({
        ...form,
        image_url,
        submitted_by: user.id,
        status: 'pending',
        google_form_url: form.google_form_url || null,
      })
      toast('Event request submitted! Admin will review it soon.', 'success')
      navigate('/')
    } catch (err) {
      toast(err.message || 'Submission failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <Home size={14} /> Home
        </Link>
        <span>/</span>
        <Link to="/events" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Events</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">Submit Request</span>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Go Back
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Submit Event Request</h1>
        <p className="text-gray-500 dark:text-gray-400">Fill in the details below. Your request will be reviewed by an admin before going live.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Event Details */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Event Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Enter event title" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea required rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your event in detail..." className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select required value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location *</label>
              <input required value={form.location} onChange={e => set('location', e.target.value)} placeholder="City or venue address" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Date & Time *</label>
              <input required type="datetime-local" value={form.event_date} onChange={e => set('event_date', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Deadline</label>
              <input type="date" value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expected Capacity</label>
            <input type="number" min="1" value={form.capacity} onChange={e => set('capacity', parseInt(e.target.value))} className="input-field" />
          </div>

          {/* Image with preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Image</label>
            {imagePreview && (
              <div className="mb-3 relative rounded-xl overflow-hidden h-40">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80">
                  Remove
                </button>
              </div>
            )}
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition-colors">
              <Upload size={20} className="text-gray-400 shrink-0" />
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Organizer Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
              <input required value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} placeholder="Your full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
              <input required type="email" value={form.organizer_email} onChange={e => set('organizer_email', e.target.value)} placeholder="your@email.com" className="input-field" />
            </div>
          </div>
        </div>

        {/* Google Form — OPTIONAL */}
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Registration Form Link
              <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Optional</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add a Google Form link so registered users can fill additional details after registering.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Google Form URL</label>
            <input
              type="url"
              value={form.google_form_url}
              onChange={e => set('google_form_url', e.target.value)}
              placeholder="https://docs.google.com/forms/d/e/.../viewform"
              className="input-field"
            />
          </div>

          {/* Instructions box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">How to get your Google Form link:</p>
            <ol className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Go to <strong>forms.google.com</strong> and create your form</li>
              <li>Click the <strong>Send</strong> button (top right)</li>
              <li>Click the <strong>🔗 link icon</strong> (middle tab)</li>
              <li>Copy the link and paste it above</li>
            </ol>
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 font-medium mt-2 hover:underline">
              <ExternalLink size={11} /> Open Google Forms
            </a>
          </div>

          {/* Live confirmation when URL is typed */}
          {form.google_form_url && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-600 text-sm">✓</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 flex-1 truncate">Form linked: {form.google_form_url}</span>
              <a href={form.google_form_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1 shrink-0">
                <ExternalLink size={11} /> Test
              </a>
            </div>
          )}
        </div>

        {/* Submit row */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 px-6">
            <ArrowLeft size={16} /> Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-base">
            {loading
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
              : <><Send size={18} />Submit Event Request</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}