import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 16 Proxy layer, routing relative API calls to the centralized Express backend.
 */
export function proxy(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname === '/health') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);
    
    // Forward headers for security and logging
    const headers = new Headers(request.headers);
    headers.set('host', new URL(backendUrl).host);
    
    return NextResponse.rewrite(targetUrl, {
      request: {
        headers
      }
    });
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/health',
  ],
};

export default proxy;
