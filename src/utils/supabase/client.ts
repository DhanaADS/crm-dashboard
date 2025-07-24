import { createBrowserClient } from '@supabase/ssr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()