// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from .env.local')
}

// Regular client for normal users (browser)
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
)

// NOTE: Do NOT create or export a service-role/admin client here. Service role keys must never be
// exposed to client bundles. Server-side code should create its own admin client via
// `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)`.