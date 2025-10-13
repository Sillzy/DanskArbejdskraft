// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const ALLOWED = (process.env.NEXT_PUBLIC_ALLOWED_DASHBOARD_UIDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname, search } = req.nextUrl;

  // Only guard the dashboard section
  if (!pathname.startsWith('/dashboard')) return res;

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL('/login', req.url);
    login.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(login);
  }

  if (ALLOWED.length > 0 && !ALLOWED.includes(user.id)) {
    return NextResponse.redirect(new URL('/', req.url)); // or your 403 page
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
