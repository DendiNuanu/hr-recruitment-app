import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Check for hardcoded admin session cookie
    const isAdminSession = request.cookies.has('admin_session')

    if (request.nextUrl.pathname.startsWith('/HRadmin') && !request.nextUrl.pathname.startsWith('/login')) {
        // Allow access if either Supabase user exists OR admin cookie is present
        if (!user && !isAdminSession) {
            // No user, redirect to login
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }
    }

    // If user is logged in (either way) and tries to access login page, redirect to admin
    if (request.nextUrl.pathname === '/login' && (user || isAdminSession)) {
        const url = request.nextUrl.clone()
        url.pathname = '/HRadmin'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
