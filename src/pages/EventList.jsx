import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { eventService } from '../services/api'
import EventCard from '../components/ui/EventCard'
import { SkeletonCard } from '../components/ui/Skeleton'
import { CATEGORIES } from '../utils/helpers'

const ITEMS_PER_PAGE = 9

export default function EventList() {
  const [sp] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(sp.get('search') || '')
  const [category, setCategory] = useState(sp.get('category') || 'all')
  const [date, setDate] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await eventService.getAll({
        status: 'active',
        category: category !== 'all' ? category : undefined,
        search: search || undefined
      })
      let filtered = data || []
      if (date) filtered = filtered.filter(e => e.event_date?.startsWith(date))
      setEvents(filtered)
      setPage(1)
    } catch (err) {
      console.error('EventList load error:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category, search, date])

  const paginated = events.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE)
  const hasFilters = search || category !== 'all' || date

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setDate('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Events</h1>
        <p className="text-gray-500 dark:text-gray-400">{loading ? '...' : `${events.length} event${events.length !== 1 ? 's' : ''} available`}</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="input-field pl-9 text-sm"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm w-auto min-w-[160px]">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field text-sm w-auto" />
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={15} /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : paginated.length
            ? paginated.map(e => <EventCard key={e.id} event={e} />)
            : (
              <div className="col-span-3 text-center py-24">
                <SlidersHorizontal size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No events found</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-brand-600 hover:underline">Clear all filters</button>
                )}
              </div>
            )
        }
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-brand-600 text-white shadow-sm' : 'btn-secondary'}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
