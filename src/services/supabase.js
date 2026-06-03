import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yarxgijetwvqzklcwstz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcnhnaWpldHd2cXprbGN3c3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzc0MTEsImV4cCI6MjA5NTgxMzQxMX0.f2Cx6kuns7iNs-DpfUa5A6cLkKYFkvnxnPth5oxb4KM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)