import {
  createClient
} from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

// Unauthenticated client for public reads
export const supabase = createClient(supabaseUrl, supabaseKey)

// Returns a Supabase client authenticated with the current Clerk JWT.
// Pass the result of `await getToken.value()` from useAuth().
export function getAuthenticatedSupabase(token) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}