import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to verify user session
 * Protects routes that require authentication
 * Django line 485: Checks for 'employee_number' in session
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/api/auth/login', '/api/auth/register', '/offline', '/privacy-policy', '/dev', '/api/dev'];

  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    // Redirect to login if not authenticated
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Django line 485: Check if 'employee_number' exists in session
  // This is the authentication check
  try {
    const sessionData = JSON.parse(sessionCookie.value);
    if (!sessionData.employee_number) {
      // Session exists but no employee_number - not authenticated
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid session' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (e) {
    // Invalid session JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Session exists with employee_number, allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, service worker, and manifest
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|service-worker.js|manifest.webmanifest|icons|apple-touch-icon.png).*)',
  ],
};
