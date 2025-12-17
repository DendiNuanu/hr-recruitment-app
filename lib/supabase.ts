import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
}

export const createClientServer = async () => {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

// For Admin actions needing the service role (bypassing RLS or when no user session)
export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    // We use standard supabase-js for the admin client as it's usually for one-off admin tasks
    const { createClient } = require('@supabase/supabase-js')
    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
