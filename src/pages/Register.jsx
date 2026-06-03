import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ArrowLeft, Home } from 'lucide-react'
import { authService } from '../services/api'
import { useToast } from '../components/ui/Toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast('Passwords do not match', 'error'); return }
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    setLoading(true)
    try {
      await authService.signUp(form.email, form.password, form.name)
      toast('Account created successfully! Please log in to get started.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.message || 'Registration failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Go Back
          </button>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
            <Home size={14} /> Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join EventHub and start exploring events</p>
        </div>

        <div className="card p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <input type={type} required value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} className="input-field" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">Log in</Link>
          </p>
        </div>

        <div className="flex justify-center gap-4 mt-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>·</span>
          <Link to="/events" className="hover:text-brand-600 transition-colors">Browse Events</Link>
          <span>·</span>
          <Link to="/login" className="hover:text-brand-600 transition-colors">Log in</Link>
        </div>
      </div>
    </div>
  )
}