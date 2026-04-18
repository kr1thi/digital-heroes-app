import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://feokokhicfueorvzpaif.supabase.co'
const supabaseKey = 'sb_publishable_mk_g7uDmJ6ssu3kLp-s_XA_oib7TmnU'

export const supabase = createClient(supabaseUrl, supabaseKey)