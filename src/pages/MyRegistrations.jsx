import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket, ClipboardList } from 'lucide-react'
import { participantService, requestService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { formatDate, STATUS_COLORS } from '../utils/helpers'
import { SkeletonRow } from '../components/ui/Skeleton'

export default function MyRegistrations() {
  const { user } = useAuth()
  const toast = useToast()
  const [registrations, setRegistrations] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('registered')

  useEffect(() => {
    Promise.all([
      participantService.getByUser(user.id),
      requestService.getByUser(user.id)
    ]).then(([regs, reqs]) => {
      setRegistrations(regs || [])
      setRequests(reqs || [])
    }).catch(() => toast('Failed to load data', 'error'))
    .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-6">My Events</h1>

      <div className="flex gap-2 mb-6">
        {[['registered', 'My Registrations', Ticket], ['requests', 'My Requests', ClipboardList]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-brand-600 text-white' : 'btn-secondary'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {tab === 'registered' && (
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />) :
           registrations.length === 0 ? (
             <div className="card p-12 text-center">
               <Ticket size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
               <p className="text-gray-500 dark:text-gray-400 font-medium">No registrations yet</p>
               <Link to="/events" className="btn-primary mt-4 inline-flex text-sm px-4 py-2">Browse Events</Link>
             </div>
           ) : registrations.map(reg => (
             <div key={reg.id} className="card p-4 hover:shadow-md transition-shadow">
               <div className="flex items-start gap-4">
                 <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                   {reg.events?.image_url
                     ? <img src={reg.events.image_url} alt="" className="w-full h-full object-cover" />
                     : <div className="w-full h-full flex items-center justify-center"><Calendar size={20} className="text-gray-400" /></div>}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                     <Link to={`/events/${reg.event_id}`} className="hover:text-brand-600">{reg.events?.title || 'Event'}</Link>
                   </h3>
                   <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                     {reg.events?.event_date && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(reg.events.event_date)}</span>}
                     {reg.events?.location && <span className="flex items-center gap-1"><MapPin size={11} />{reg.events.location}</span>}
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Registered {formatDate(reg.registration_date)}</p>
                 </div>
                 <span className={`badge ${STATUS_COLORS[reg.events?.status || 'active']} shrink-0`}>{reg.events?.status || 'active'}</span>
               </div>
             </div>
           ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />) :
           requests.length === 0 ? (
             <div className="card p-12 text-center">
               <ClipboardList size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
               <p className="text-gray-500 dark:text-gray-400 font-medium">No event requests submitted</p>
               <Link to="/request-event" className="btn-primary mt-4 inline-flex text-sm px-4 py-2">Submit a Request</Link>
             </div>
           ) : requests.map(req => (
             <div key={req.id} className="card p-4">
               <div className="flex items-start justify-between gap-4">
                 <div>
                   <h3 className="font-semibold text-gray-900 dark:text-white">{req.title}</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{req.description}</p>
                   <p className="text-xs text-gray-400 mt-2">{req.category} · {formatDate(req.event_date)}</p>
                   {req.admin_notes && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">Admin note: {req.admin_notes}</p>}
                 </div>
                 <span className={`badge shrink-0 ${STATUS_COLORS[req.status]}`}>{req.status}</span>
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  )
}
