import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar, MapPin, Users, Clock, Share2, Star,
  CheckCircle, AlertCircle, ArrowLeft, ExternalLink,
  UserCircle, Mail, Phone, Building, FileText, X
} from 'lucide-react'
import { eventService, participantService, userService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { formatDateTime, formatDate, isDeadlinePassed, STATUS_COLORS } from '../utils/helpers'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'

// ─── Registration Modal ───────────────────────────────────────────────────────
function RegistrationModal({ event, onClose, onSuccess }) {
  const { profile, user } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState(1) // 1=form, 2=google-form link
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.name || '',
    email: profile?.email || user?.email || '',
    phone: '',
    organization: '',
    designation: '',
    message: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone.trim()) { toast('Phone number is required', 'error'); return }
    setSubmitting(true)
    try {
      await participantService.registerWithInfo(
        event.id, user.id,
        form.full_name, form.email,
        { phone: form.phone, organization: form.organization, designation: form.designation, message: form.message }
      )
      setStep(2)
      onSuccess()
    } catch (e) {
      toast(e.message || 'Registration failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Build a prefilled Google Form URL if the event has one, otherwise a generic confirmation
  const googleFormUrl = event.google_form_url
    ? `${event.google_form_url}?entry.name=${encodeURIComponent(form.full_name)}&entry.email=${encodeURIComponent(form.email)}&entry.phone=${encodeURIComponent(form.phone)}&entry.event=${encodeURIComponent(event.title)}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {step === 1 ? 'Register for Event' : '🎉 Registration Complete!'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* ── STEP 1: Info Form ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                Fill in your details below. After submitting, you'll receive a Google Form link to complete your registration.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <UserCircle size={14} className="inline mr-1.5" />Full Name *
                  </label>
                  <input
                    required
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    placeholder="Your full name"
                    className="input-field"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Mail size={14} className="inline mr-1.5" />Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Phone size={14} className="inline mr-1.5" />Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="input-field"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Building size={14} className="inline mr-1.5" />Organization / Institution
                  </label>
                  <input
                    value={form.organization}
                    onChange={e => set('organization', e.target.value)}
                    placeholder="Your company or university"
                    className="input-field"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FileText size={14} className="inline mr-1.5" />Designation / Role
                  </label>
                  <input
                    value={form.designation}
                    onChange={e => set('designation', e.target.value)}
                    placeholder="Student / Developer / Manager..."
                    className="input-field"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Why do you want to attend? (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    placeholder="Tell the organizer why you're interested..."
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
              >
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                  : 'Submit & Continue →'
                }
              </button>
            </form>
          )}

          {/* ── STEP 2: Success + Google Form ── */}
          {step === 2 && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're Registered!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Your information has been saved. Please complete the Google Form below to finalize your registration.
                </p>
              </div>

              {/* Registration summary */}
              <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your Details</p>
                {[
                  ['Name', form.full_name],
                  ['Email', form.email],
                  ['Phone', form.phone],
                  form.organization && ['Organization', form.organization],
                  form.designation && ['Role', form.designation],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-24 shrink-0">{k}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>

              {/* Google Form CTA */}
              <div className="space-y-3">
                {googleFormUrl ? (
                  <>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click below to open the Google Form and complete your registration:
                    </p>
                    <a
                      href={googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
                    >
                      <ExternalLink size={18} />
                      Open Registration Form
                    </a>
                    <p className="text-xs text-gray-400">
                      Your details are pre-filled in the form. Opens in a new tab.
                    </p>
                  </>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                      ✅ Registration Complete
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      The organizer has not set up a Google Form for this event. Your registration has been saved. You may be contacted via email with further details.
                    </p>
                  </div>
                )}
              </div>

              <button onClick={onClose} className="btn-secondary w-full py-2.5">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main EventDetail Page ────────────────────────────────────────────────────
export default function EventDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const toast = useToast()
  const [event, setEvent] = useState(null)
  const [host, setHost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRegModal, setShowRegModal] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [interested, setInterested] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const ev = await eventService.getById(id)
        setEvent(ev)
        const count = await eventService.getParticipantCount(id)
        setParticipantCount(count)
        // Load host info
        if (ev.created_by) {
          try {
            const h = await userService.getProfile(ev.created_by)
            setHost(h)
          } catch { /* host info optional */ }
        }
        if (user) {
          const reg = await participantService.isRegistered(id, user.id)
          setRegistered(reg)
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: event?.title, url })
    } else {
      navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  const handleRegistrationSuccess = () => {
    setRegistered(true)
    setParticipantCount(c => c + 1)
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      <div className="skeleton h-72 rounded-2xl" />
      <div className="skeleton h-8 w-2/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  )

  if (error || !event) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-2">Event not found</p>
      <Link to="/events" className="btn-primary mt-2 inline-flex">Back to Events</Link>
    </div>
  )

  const spotsLeft = (event.capacity || 0) - participantCount
  const deadlinePassed = isDeadlinePassed(event.registration_deadline)
  const isFull = event.capacity > 0 && spotsLeft <= 0
  const canRegister = !registered && !deadlinePassed && !isFull && event.status === 'active'

  // Google Maps embed URL from location string
  const mapsEmbedUrl = event.location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
    : null

  const mapsLinkUrl = event.location
    ? `https://maps.google.com/?q=${encodeURIComponent(event.location)}`
    : null

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Events
        </Link>

        {/* ── Hero Image ── */}
        <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 shadow-lg">
          <img
            src={event.image_url || DEFAULT_IMG}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = DEFAULT_IMG }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {event.category && (
            <span className="absolute top-4 left-4 badge bg-white/90 text-gray-700 shadow">{event.category}</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title + date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-red-500 text-white rounded-lg px-2.5 py-1 text-center min-w-[3rem] shadow-sm">
                  <div className="text-xs font-bold uppercase leading-none">
                    {event.event_date ? new Date(event.event_date).toLocaleString('en', { month: 'short' }) : ''}
                  </div>
                  <div className="text-xl font-black leading-tight">
                    {event.event_date ? new Date(event.event_date).getDate() : ''}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-500">{formatDateTime(event.event_date)}</p>
                  {event.registration_deadline && (
                    <p className="text-xs text-gray-400">Registration deadline: {formatDate(event.registration_deadline)}</p>
                  )}
                </div>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Going / Interested counts */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex -space-x-1">
                  {[...Array(Math.min(3, participantCount || 1))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-brand-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span><strong>{participantCount}</strong> going</span>
              </div>
              {(event.interested_count || interested) && (
                <span className="text-sm text-gray-500">
                  · <strong>{(event.interested_count || 0) + (interested ? 1 : 0)}</strong> interested
                </span>
              )}
            </div>

            {/* Action buttons — Facebook style */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInterested(i => !i)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  interested
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Star size={16} className={interested ? 'fill-white' : ''} />
                {interested ? 'Interested ✓' : 'Interested'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Share2 size={16} />
                {shared ? 'Link Copied!' : 'Share'}
              </button>
            </div>

            {/* Description */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Location + Map */}
            {event.location && (
              <div className="card p-5">
                <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-brand-600" /> Location
                </h2>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">{event.location}</p>

                {/* Google Maps embed */}
                <div className="rounded-xl overflow-hidden h-52 border border-gray-200 dark:border-gray-700">
                  <iframe
                    title="Event Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={mapsEmbedUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mt-2"
                >
                  <ExternalLink size={14} /> Open in Google Maps
                </a>
              </div>
            )}

            {/* Meet Your Host */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Meet Your Host</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md">
                  {(host?.name || event.organizer_name || 'H')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {host?.name || event.organizer_name || 'Event Organizer'}
                  </p>
                  {host?.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{host.email}</p>
                  )}
                  <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mt-1">
                    Organizer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Sticky Registration Card ── */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-20">
              {/* Capacity progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Guests</span>
                  <span className="text-sm text-gray-500">{participantCount} / {event.capacity}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-brand-600'}`}
                    style={{ width: `${Math.min(100, event.capacity ? (participantCount / event.capacity) * 100 : 0)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{participantCount} going</span>
                  <span>{isFull ? 'Full' : `${spotsLeft} spots left`}</span>
                </div>
              </div>

              {/* Details list */}
              <div className="space-y-3 mb-5 text-sm">
                <div className="flex items-start gap-2.5 text-gray-600 dark:text-gray-300">
                  <Calendar size={16} className="text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(event.event_date)}</p>
                    <p className="text-xs text-gray-400">Event date</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-2.5 text-gray-600 dark:text-gray-300">
                    <MapPin size={16} className="text-brand-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.location}</p>
                      <p className="text-xs text-gray-400">Venue</p>
                    </div>
                  </div>
                )}
                {event.registration_deadline && (
                  <div className="flex items-start gap-2.5 text-gray-600 dark:text-gray-300">
                    <Clock size={16} className={`mt-0.5 shrink-0 ${deadlinePassed ? 'text-red-500' : 'text-brand-600'}`} />
                    <div>
                      <p className={`font-medium ${deadlinePassed ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                        {formatDate(event.registration_deadline)}
                        {deadlinePassed && ' — Closed'}
                      </p>
                      <p className="text-xs text-gray-400">Registration deadline</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Register button states */}
              {registered ? (
                <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle size={18} /> You're Going!
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Registration confirmed</p>
                </div>
              ) : deadlinePassed ? (
                <div className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center text-gray-400 text-sm font-medium">
                  Registration Closed
                </div>
              ) : isFull ? (
                <div className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center text-red-500 font-semibold text-sm border border-red-200 dark:border-red-800">
                  Event Full
                </div>
              ) : !user ? (
                <Link to="/login" className="btn-primary w-full py-3 text-center block font-semibold">
                  Sign in to Register
                </Link>
              ) : (
                <button
                  onClick={() => setShowRegModal(true)}
                  className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2"
                >
                  <Users size={17} /> Register Now
                </button>
              )}

              {/* Google Form direct link if exists */}
              {event.google_form_url && !registered && user && (
                <a
                  href={event.google_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <ExternalLink size={15} /> Open Registration Form
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <RegistrationModal
          event={event}
          onClose={() => setShowRegModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </>
  )
}
