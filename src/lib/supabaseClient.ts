// src/lib/supabaseClient.ts 
// (Make sure you've renamed the file!)

import { createBrowserClient } from '@supabase/ssr'

// Get the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Throw an error if the variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from .env.local')
}

// Create and export the new browser client
// This is a "singleton" instance, meaning it's created once and reused.
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
)