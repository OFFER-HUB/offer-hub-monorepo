import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const isProd = process.env.NODE_ENV === 'production'

if (!supabaseUrl || !supabaseKey) {
  if (isProd) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production')
  } else {
    console.warn('Using missing Supabase env vars in development; some features may not work')
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey)
