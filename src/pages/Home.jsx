import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Zap, Shield, Calendar, Star } from 'lucide-react'
import { eventService } from '../services/api'
import EventCard from '../components/ui/EventCard'
import { SkeletonCard } from '../components/ui/Skeleton'
import { CATEGORIES } from '../utils/helpers'

const HERO_BG = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80'

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    eventService.getAll({ status: 'active' })
      .then(data => setEvents((data || []).slice(0, 6)))
      .catch(err => { console.error('Home load error:', err); setEvents([]) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-sm font-medium mb-6">
              <Zap size={14} /> Discover Amazing Events
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Find & Join Events<br />
              <span className="text-brand-400">Near You</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Browse hundreds of events, from tech conferences to cultural festivals. Register in seconds.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (window.location.href = `/events?search=${search}`)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Search events..."
                />
              </div>
              <Link to={`/events${search ? `?search=${search}` : ''}`} className="btn-primary py-3.5 flex items-center gap-2 justify-center">
                Explore <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/events?category=${encodeURIComponent(cat)}`}
                className="shrink-0 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-400 transition-all">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-600 font-medium text-sm mb-1">What's On</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
          </div>
          <Link to="/events" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : events.length
              ? events.map(e => <EventCard key={e.id} event={e} />)
              : (
                <div className="col-span-3 text-center py-16">
                  <Calendar size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No upcoming events yet</p>
                  <p className="text-sm text-gray-400 mt-1">Check back soon or submit your own event request</p>
                </div>
              )
          }
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Discover Events', desc: 'Browse and filter events by category, date, or location with real-time search.' },
              { icon: Calendar, title: 'Easy Registration', desc: 'One-click registration with instant confirmation and capacity tracking.' },
              { icon: Shield, title: 'Trusted Platform', desc: 'All events are reviewed and approved before going live.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">Want to host your own event?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Submit an event request and our team will review it within 24 hours.</p>
        <Link to="/request-event" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
          <Star size={16} /> Submit Event Request
        </Link>
      </section>
    </div>
  )
}
