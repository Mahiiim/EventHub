import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, Save, ArrowLeft, Home, User, Mail, Phone, MapPin, Briefcase, Globe, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { supabase } from '../services/supabase'

export default function Profile() {
    const { user, profile, refreshProfile } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const fileRef = useRef()

    const [tab, setTab] = useState('profile')
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    const [form, setForm] = useState({
        name: profile?.name || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        bio: profile?.bio || '',
        designation: profile?.designation || '',
        website: profile?.website || '',
    })

    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
    const [pwSuccess, setPwSuccess] = useState(false)

    // Switch to password tab if URL has ?tab=password
    useEffect(() => {
        if (searchParams.get('tab') === 'password') setTab('password')
    }, [searchParams])

    // Sync form when profile loads
    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name || '',
                phone: profile.phone || '',
                location: profile.location || '',
                bio: profile.bio || '',
                designation: profile.designation || '',
                website: profile.website || '',
            })
        }
    }, [profile])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 3 * 1024 * 1024) { toast('Image must be under 3 MB', 'error'); return }
        setUploadingAvatar(true)
        try {
            const ext = file.name.split('.').pop()
            const path = `avatars/${user.id}.${ext}`
            const { error: upErr } = await supabase.storage
                .from('event-images').upload(path, file, { upsert: true })
            if (upErr) throw upErr
            const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(path)
            await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
            await refreshProfile()
            toast('Profile picture updated!', 'success')
        } catch (err) {
            toast(err.message || 'Upload failed', 'error')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) { toast('Name is required', 'error'); return }
        setSaving(true)
        try {
            const { error } = await supabase.from('users').update({
                name: form.name.trim(),
                phone: form.phone || null,
                location: form.location || null,
                bio: form.bio || null,
                designation: form.designation || null,
                website: form.website || null,
            }).eq('id', user.id)
            if (error) throw error
            await refreshProfile()
            toast('Profile updated successfully!', 'success')
        } catch (err) {
            toast(err.message || 'Update failed', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (pwForm.next.length < 6) { toast('New password must be at least 6 characters', 'error'); return }
        if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return }
        setSaving(true)
        try {
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: user.email, password: pwForm.current
            })
            if (signInErr) throw new Error('Current password is incorrect')
            const { error } = await supabase.auth.updateUser({ password: pwForm.next })
            if (error) throw error
            setPwForm({ current: '', next: '', confirm: '' })
            setPwSuccess(true)
            setTimeout(() => setPwSuccess(false), 4000)
            toast('Password changed successfully!', 'success')
        } catch (err) {
            toast(err.message || 'Password change failed', 'error')
        } finally {
            setSaving(false)
        }
    }

    const avatarUrl = profile?.avatar_url
    const initials = profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Link to="/" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                    <Home size={14} /> Home
                </Link>
                <span>/</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">My Profile</span>
            </div>

            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Go Back
            </button>

            {/* Avatar card */}
            <div className="card p-6 mb-6 flex items-center gap-5">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center ring-4 ring-brand-100 dark:ring-brand-900/30">
                        {avatarUrl
                            ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            : <span className="text-white text-2xl font-bold">{initials}</span>
                        }
                    </div>
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                        {uploadingAvatar
                            ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Camera size={13} />
                        }
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                    <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
                    {profile?.role === 'admin' && (
                        <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mt-1">Admin</span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Click the camera icon to change photo</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    ['profile', 'Edit Profile', User],
                    ['password', 'Change Password', Lock],
                ].map(([key, label, Icon]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-brand-600 text-white shadow-sm' : 'btn-secondary'
                            }`}>
                        <Icon size={15} />{label}
                    </button>
                ))}
            </div>

            {/* ── PROFILE TAB ── */}
            {tab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="card p-6 space-y-5">
                    <h2 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Personal Information</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5"><User size={14} />Full Name *</span>
                        </label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="input-field" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5"><Mail size={14} />Email</span>
                        </label>
                        <input value={profile?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5"><Phone size={14} />Phone Number</span>
                            </label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+880 1XXX-XXXXXX" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5"><MapPin size={14} />Location</span>
                            </label>
                            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className="input-field" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5"><Briefcase size={14} />Designation / Role</span>
                            </label>
                            <input value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Software Engineer" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5"><Globe size={14} />Website</span>
                            </label>
                            <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yoursite.com" className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                        <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell others a bit about yourself..." className="input-field resize-none" />
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                        {saving
                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                            : <><Save size={16} />Save Profile</>
                        }
                    </button>
                </form>
            )}

            {/* ── PASSWORD TAB ── */}
            {tab === 'password' && (
                <form onSubmit={handleChangePassword} className="card p-6 space-y-5">
                    <h2 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Change Password</h2>

                    {pwSuccess && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Password changed successfully!</p>
                        </div>
                    )}

                    {[
                        { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                        { key: 'next', label: 'New Password', placeholder: 'At least 6 characters' },
                        { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                    ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5"><Lock size={14} />{label}</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPw[key] ? 'text' : 'password'}
                                    required
                                    value={pwForm[key]}
                                    onChange={e => setPw(key, e.target.value)}
                                    placeholder={placeholder}
                                    className="input-field pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            After changing your password, you will remain logged in on this device.
                        </p>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                        {saving
                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                            : <><Lock size={16} />Change Password</>
                        }
                    </button>
                </form>
            )}
        </div>
    )
}