import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isOwnerRoute = req.nextUrl.pathname.startsWith('/owner');
    const isTenantRoute = req.nextUrl.pathname.startsWith('/tenant');

    // Redirect to home if user tries to access owner routes without owner role
    if (isOwnerRoute && token?.role !== 'OWNER') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Redirect to home if user tries to access tenant routes without tenant role
    if (isTenantRoute && token?.role !== 'TENANT') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/owner/:path*', '/tenant/:path*'],
}; 