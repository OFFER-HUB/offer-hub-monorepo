import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://example.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'example_key'

export const supabase = createClient(supabaseUrl, supabaseKey)
