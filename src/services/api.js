import { supabase } from './supabase'

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authService = {
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('users').upsert(
        { id: data.user.id, name, email, role: 'user' },
        { onConflict: 'id' }
      )
    }
    return data
  },
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export const userService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    return data
  },
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  async updateRole(userId, role) {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId)
    if (error) throw error
  }
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
export const eventService = {
  async getAll({ category, search, status } = {}) {
    let query = supabase
      .from('events')
      .select(`
        *,
        participants(count),
        event_interests(count)
      `)
      .order('event_date', { ascending: true })
    if (status && status !== 'all') query = query.eq('status', status)
    if (category && category !== 'all') query = query.eq('category', category)
    if (search && search.trim()) query = query.ilike('title', `%${search.trim()}%`)
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(e => ({
      ...e,
      going_count: e.participants?.[0]?.count || 0,
      interested_count: e.event_interests?.[0]?.count || 0,
    }))
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        participants(count),
        event_interests(count)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return {
      ...data,
      going_count: data.participants?.[0]?.count || 0,
      interested_count: data.event_interests?.[0]?.count || 0,
    }
  },
  async create(eventData) {
    const payload = Object.fromEntries(
      Object.entries(eventData).filter(([, v]) => v !== '' && v !== undefined)
    )
    const { data, error } = await supabase
      .from('events').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { id: _id, created_at, participants, event_interests, going_count, interested_count, ...cleanUpdates } = updates;
    const payload = Object.fromEntries(
      Object.entries(cleanUpdates).filter(([, v]) => v !== undefined)
    )
    const { data, error } = await supabase
      .from('events').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
  },

  async getParticipantCount(eventId) {
    const { count, error } = await supabase
      .from('participants').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    if (error) return 0
    return count || 0
  }
}

// ─── EVENT REQUESTS ───────────────────────────────────────────────────────────
export const requestService = {
  async getAll() {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('event_requests').select('*').eq('submitted_by', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(requestData) {
    const payload = Object.fromEntries(
      Object.entries(requestData).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    )
    const { data, error } = await supabase
      .from('event_requests').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async updateStatus(id, status, admin_notes) {
    const update = { status }
    if (admin_notes !== undefined) update.admin_notes = admin_notes
    const { data, error } = await supabase
      .from('event_requests').update(update).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async approveAndCreate(request, adminId) {
    await requestService.updateStatus(request.id, 'approved', request.admin_notes || null)
    const event = await eventService.create({
      title: request.title,
      description: request.description,
      category: request.category,
      location: request.location,
      event_date: request.event_date,
      image_url: request.image_url || null,
      capacity: request.capacity || 100,
      registration_deadline: request.registration_deadline || null,
      organizer_name: request.organizer_name || null,
      organizer_email: request.organizer_email || null,
      google_form_url: request.google_form_url || null,
      created_by: adminId,
      status: 'active'
    })
    return event
  }
}

// ─── PARTICIPANTS ─────────────────────────────────────────────────────────────
export const participantService = {
  // Basic register (used internally)
  async register(eventId, userId, name, email) {
    const { data: existing } = await supabase
      .from('participants').select('id')
      .eq('event_id', eventId).eq('user_id', userId).maybeSingle()
    if (existing) throw new Error('You are already registered for this event')

    const { data, error } = await supabase.from('participants').insert({
      event_id: eventId, user_id: userId,
      participant_name: name, participant_email: email
    }).select().single()
    if (error) throw error
    return data
  },

  // Full register with extra info fields (phone, org, designation, message)
  async registerWithInfo(eventId, userId, name, email, extraInfo = {}) {
    const { data: existing } = await supabase
      .from('participants').select('id')
      .eq('event_id', eventId).eq('user_id', userId).maybeSingle()
    if (existing) throw new Error('You are already registered for this event')

    const payload = {
      event_id: eventId,
      user_id: userId,
      participant_name: name,
      participant_email: email,
      phone: extraInfo.phone || null,
      organization: extraInfo.organization || null,
      designation: extraInfo.designation || null,
      message: extraInfo.message || null,
    }

    const { data, error } = await supabase
      .from('participants').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async getByEvent(eventId) {
    const { data, error } = await supabase
      .from('participants').select('*').eq('event_id', eventId)
      .order('registration_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('participants').select('*, events(*)')
      .eq('user_id', userId).order('registration_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  async remove(id) {
    const { error } = await supabase.from('participants').delete().eq('id', id)
    if (error) throw error
  },

  async isRegistered(eventId, userId) {
    const { data } = await supabase
      .from('participants').select('id')
      .eq('event_id', eventId).eq('user_id', userId).maybeSingle()
    return !!data
  }
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
export const storageService = {
  async uploadEventImage(file) {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from('event-images').upload(fileName, file, { upsert: false })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage
      .from('event-images').getPublicUrl(data.path)
    return publicUrl
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export const statsService = {
  async getOverview() {
    const [eventsRes, participantsRes, requestsRes, usersRes, recentRes] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('participants').select('*', { count: 'exact', head: true }),
      supabase.from('event_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('participants').select('*, events(title)').order('registration_date', { ascending: false }).limit(5)
    ])
    return {
      totalEvents: eventsRes.count || 0,
      totalParticipants: participantsRes.count || 0,
      pendingRequests: requestsRes.count || 0,
      totalUsers: usersRes.count || 0,
      recentRegistrations: recentRes.data || []
    }
  }
}
