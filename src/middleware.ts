import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define protected and public routes
    const isProtectedRoute = pathname.startsWith('/dashboard') || (pathname.startsWith('/sthapati') && pathname !== '/sthapati/admin');
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isStatusPage = pathname.startsWith('/auth/status');
    const isCompletePage = pathname.startsWith('/auth/complete');

    // 2. Get the token (server-side check)
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // 3. Handle Unauthenticated Users
    if (!token) {
        // If trying to access protected route, redirect to login
        if (isProtectedRoute) {
            const url = new URL('/login', request.url);
            url.searchParams.set('callbackUrl', encodeURI(request.url));
            return NextResponse.redirect(url);
        }
        // Allow access to public routes
        return NextResponse.next();
    }

    // 4. Handle Authenticated Users
    const userStatus = token.userStatus as string | undefined;
    const userCategory = token.userCategory as string | undefined;

    // SCENARIO: Incomplete Profile (Logged in but no DB record/status)
    // Only force onboarding if they try to access the USER DASHBOARD
    if (!userStatus) {
        if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/register', request.url));
        }
        // Allow access to everything else (Admin panel, Home, etc.)
        return NextResponse.next();
    }

    // SCENARIO: Pending User
    if (userStatus === 'pending') {
        // Allow them to be on the status page or completion page
        if (isStatusPage || isCompletePage) {
            return NextResponse.next();
        }

        // Only redirect protected routes
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/auth/status?state=pending', request.url));
        }

        // Allow access to public pages (Home, About, etc.) and Auth pages
        return NextResponse.next();
    }

    // SCENARIO: Rejected or Banned User
    if (userStatus === 'rejected' || userStatus === 'banned') {
        if (isStatusPage) {
            return NextResponse.next();
        }
        if (!pathname.startsWith('/api')) {
            return NextResponse.redirect(new URL(`/auth/status?state=${userStatus}`, request.url));
        }
    }

    // SCENARIO: Active User
    if (userStatus === 'active') {
        const isAdmin = (token as any).isAdmin;
        const isAdminRoute = pathname.startsWith('/sthapati');

        // STRICT ADMIN CHECK
        if (isAdminRoute && !isAdmin) {
            console.log(`[Middleware] Non-admin accessing admin route. Redirecting.`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // If trying to access status while active, send to dashboard
        if (isStatusPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // FORCED PROFILE COMPLETION CHECK
        const isProfileComplete = (token as any).isProfileComplete;
        console.log(`[Middleware] User: ${token.email}, Status: ${userStatus}, Complete: ${isProfileComplete}, Path: ${pathname}`);

        if (!isProfileComplete && !isAdminRoute) {
            // Allow access to the edit-profile page
            if (pathname === '/dashboard/edit-profile') {
                return NextResponse.next();
            }
            // Redirect all other dashboard routes to edit-profile
            if (pathname.startsWith('/dashboard')) {
                console.log(`[Middleware] Redirecting to edit-profile`);
                return NextResponse.redirect(new URL('/dashboard/edit-profile', request.url));
            }
        }

        // Allow access to dashboard, auth routes, and other routes
        return NextResponse.next();
    }

    // Fallback
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
         * - public files (svg, png, jpg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
