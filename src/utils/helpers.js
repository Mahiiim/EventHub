import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return 'TBD'
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy') } catch { return date }
}
export const formatDateTime = (date) => {
  if (!date) return 'TBD'
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy · h:mm a') } catch { return date }
}
export const timeAgo = (date) => {
  try { return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true }) } catch { return '' }
}
export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false
  try { return isPast(parseISO(deadline)) } catch { return false }
}
export const CATEGORIES = ['Technology', 'Business', 'Arts & Culture', 'Sports', 'Education', 'Health & Wellness', 'Networking', 'Music', 'Food & Drink', 'Other']
export const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
export const exportCSV = (data, filename) => {
  if (!data?.length) return
  const headers = Object.keys(data[0])
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename + '.csv'; a.click()
  URL.revokeObjectURL(url)
}
