import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
      } else {
        // Profile row doesn't exist yet — build one from auth metadata
        const fallback = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: 'user'
        }
        // Try to insert it so future loads succeed
        await supabase.from('users').upsert(fallback, { onConflict: 'id' })
        setProfile(fallback)
      }
    } catch {
      // Network error or RLS blocked — use auth metadata as fallback
      setProfile({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || 'User',
        role: 'user'
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
    })
    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = profile?.role === 'admin'
  const refreshProfile = () => user && loadProfile(user)

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
