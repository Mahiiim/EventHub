import { Link } from 'react-router-dom'
import { Calendar, MapPin, Share2, Star } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80'

export default function EventCard({ event }) {
  const { user } = useAuth()
  const [shared, setShared] = useState(false)
  const [interested, setInterested] = useState(false)
  const [interestedCount, setInterestedCount] = useState(event.interested_count || 0)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('event_interests')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setInterested(true) })
  }, [event.id, user])

  const handleInterested = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { window.location.href = '/login'; return }
    if (toggling) return
    setToggling(true)
    try {
      if (interested) {
        await supabase.from('event_interests')
          .delete().eq('event_id', event.id).eq('user_id', user.id)
        setInterested(false)
        setInterestedCount(c => Math.max(0, c - 1))
      } else {
        await supabase.from('event_interests')
          .insert({ event_id: event.id, user_id: user.id })
        setInterested(true)
        setInterestedCount(c => c + 1)
      }
    } catch (err) {
      console.error('Interest toggle error:', err)
    } finally {
      setToggling(false)
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/events/${event.id}`
    if (navigator.share) {
      navigator.share({ title: event.title, url })
    } else {
      navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  const goingCount = event.going_count || 0

  return (
    <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      <Link to={`/events/${event.id}`} className="relative overflow-hidden h-48 block shrink-0">
        <img
          src={event.image_url || DEFAULT_IMG}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = DEFAULT_IMG }}
          loading="lazy"
        />
        {event.category && (
          <span className="absolute top-3 left-3 badge bg-white/90 text-gray-700 shadow-sm">{event.category}</span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-1">
          {formatDate(event.event_date)}
        </p>

        <Link to={`/events/${event.id}`}>
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
            {event.title}
          </h3>
        </Link>

        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 min-h-[1rem]">
          {interestedCount > 0 && (
            <span className="font-medium text-gray-600 dark:text-gray-300">{interestedCount} interested</span>
          )}
          {interestedCount > 0 && goingCount > 0 && <span> · </span>}
          {goingCount > 0 && <span>{goingCount} going</span>}
        </p>

        <div className="flex-1" />

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleInterested}
            disabled={toggling}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-all ${interested
                ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Star size={15} className={interested ? 'fill-brand-500 text-brand-500' : ''} />
            Interested
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <Share2 size={15} />
            {shared ? 'Copied!' : 'Share'}
          </button>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-2 w-full text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        >
          View & Register
        </Link>
      </div>
    </div>
  )
}