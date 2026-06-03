import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react'

const ToastContext = createContext(null)

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info }
const styles = {
  success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])
  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type]
          return (
            <div key={id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up ${styles[type]}`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span className="text-sm font-medium flex-1">{message}</span>
              <button onClick={() => remove(id)} className="shrink-0 opacity-60 hover:opacity-100"><X size={14} /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
