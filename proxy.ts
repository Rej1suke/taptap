import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy'

// Customer-facing routes never need a staff session refresh.
function isPublicCustomerPath(pathname: string): boolean {
    return pathname === '/' || pathname === '/menu' || pathname.startsWith('/order/') ||
        pathname === '/api/orders' || pathname.startsWith('/api/orders/')
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
    if (isPublicCustomerPath(request.nextUrl.pathname)) {
        return NextResponse.next()
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
