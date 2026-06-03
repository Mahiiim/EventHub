import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, Calendar } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function AuthConfirm() {
    const navigate = useNavigate()
    const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('')
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        // Supabase puts tokens in the URL hash after email confirmation
        const hash = window.location.hash
        const params = new URLSearchParams(hash.replace('#', '?'))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const errorDesc = params.get('error_description')
        const type = params.get('type') // 'signup' or 'recovery'

        if (errorDesc) {
            setStatus('error')
            setErrorMsg(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
            return
        }

        if (accessToken && refreshToken) {
            // Set the session from the tokens in the URL
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
                .then(({ error }) => {
                    if (error) {
                        setStatus('error')
                        setErrorMsg(error.message)
                    } else {
                        setStatus('success')
                    }
                })
        } else {
            // Try reading current session (user may already be confirmed)
            supabase.auth.getSession().then(({ data }) => {
                if (data?.session) {
                    setStatus('success')
                } else {
                    setStatus('error')
                    setErrorMsg('No confirmation token found. The link may have expired.')
                }
            })
        }
    }, [])

    // Auto-redirect countdown after success
    useEffect(() => {
        if (status !== 'success') return
        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    clearInterval(timer)
                    navigate('/')
                    return 0
                }
                return c - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [status, navigate])

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md text-center">

                {/* Logo */}
                <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Calendar size={28} className="text-white" />
                </div>

                {/* Loading */}
                {status === 'loading' && (
                    <div className="card p-10 shadow-xl">
                        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Loader size={32} className="text-brand-600 animate-spin" />
                        </div>
                        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Confirming your email…
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Please wait while we verify your account.
                        </p>
                    </div>
                )}

                {/* Success */}
                {status === 'success' && (
                    <div className="card p-10 shadow-xl">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={36} className="text-emerald-600" />
                        </div>
                        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Email Confirmed! 🎉
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Your account has been successfully verified. You can now log in and start exploring events.
                        </p>

                        {/* Countdown bar */}
                        <div className="mb-5">
                            <p className="text-xs text-gray-400 mb-2">
                                Redirecting to home in <span className="font-semibold text-brand-600">{countdown}</span> seconds…
                            </p>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${(countdown / 5) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link to="/login" className="flex-1 btn-secondary py-2.5 text-sm font-medium text-center">
                                Log in
                            </Link>
                            <Link to="/" className="flex-1 btn-primary py-2.5 text-sm font-medium text-center">
                                Go to Home
                            </Link>
                        </div>
                    </div>
                )}

                {/* Error */}
                {status === 'error' && (
                    <div className="card p-10 shadow-xl">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                            <XCircle size={36} className="text-red-500" />
                        </div>
                        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Confirmation Failed
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            We couldn't verify your email address.
                        </p>
                        {errorMsg && (
                            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mb-6 border border-red-100 dark:border-red-800">
                                {errorMsg}
                            </p>
                        )}
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400">
                                The confirmation link may have expired (links expire after 24 hours). Try registering again with the same email.
                            </p>
                            <div className="flex gap-3">
                                <Link to="/register" className="flex-1 btn-secondary py-2.5 text-sm font-medium text-center">
                                    Register Again
                                </Link>
                                <Link to="/login" className="flex-1 btn-primary py-2.5 text-sm font-medium text-center">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}