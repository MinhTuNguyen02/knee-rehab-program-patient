import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the routes that require authentication here
const protectedRoutes = ['/dashboard', '/history', '/profile', '/chat', '/change-password'];
const authRoutes = ['/login', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest) {
    const token = request.cookies.get('jwt')?.value;
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // Redirect to login if accessing a protected route without a token
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);

        loginUrl.searchParams.set('reason', 'expired');
        // Can optionally pass a next/returnTo parameter here
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if accessing auth routes with a token
    // (except change-password which is protected)
    if (isAuthRoute && token) {
        if (request.nextUrl.searchParams.get('reason') === 'expired') {
            const response = NextResponse.next();
            response.cookies.delete('jwt');
            return response;
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Default redirect to login for root route if not authenticated
    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (like illustrations, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
