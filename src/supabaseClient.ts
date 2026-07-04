import { createClient } from '@supabase/supabase-js'

// Setup strict client instantiations using environment variables only
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://owsgxvgauuecyffiewhn.supabase.co'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Throw descriptive developer warnings if keys are missing in build-time configuration
if (!supabaseAnonKey) {
  console.warn('Supabase publishable key is missing. Make sure to define VITE_SUPABASE_ANON_KEY in your production environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
