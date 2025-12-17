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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // SAFE MODE: If keys are missing, return a dummy client instead of crashing
    if (!supabaseUrl || !supabaseKey) {
        console.warn('MISSING SUPABASE KEYS: Returning mock client to prevent crash.')
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: { message: 'Missing Supabase Keys' } }),
                getSession: async () => ({ data: { session: null }, error: null }),
                signOut: async () => ({ error: null }),
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: { message: 'Missing Supabase Keys' } }),
                        maybeSingle: async () => ({ data: null, error: null }),
                        order: () => ({ data: [], error: null }),
                    }),
                    insert: async () => ({ data: null, error: { message: 'Missing Supabase Keys' } }),
                    update: async () => ({ data: null, error: { message: 'Missing Supabase Keys' } }),
                    delete: async () => ({ data: null, error: { message: 'Missing Supabase Keys' } }),
                    order: () => ({ data: [], error: null }),
                }),
            }),
        } as any
    }

    return createServerClient(
        supabaseUrl,
        supabaseKey,
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

    if (!supabaseUrl || !serviceKey) {
        console.warn('MISSING ADMIN KEYS: Returning mock admin client.')
        return {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                admin: {
                    createUser: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                    deleteUser: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                }
            },
            storage: {
                from: () => ({
                    upload: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                    getPublicUrl: () => ({ data: { publicUrl: '' } }),
                })
            },
            from: () => ({
                insert: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                update: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                delete: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: { message: 'Missing Service Key' } }),
                    })
                })
            })
        } as any
    }

    // We use standard supabase-js for the admin client as it's usually for one-off admin tasks
    const { createClient } = require('@supabase/supabase-js')
    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
