// lib/supabase-server.ts
import { cookies as nextCookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use in Server Components (RSC) */
export async function getServerSupabase() {
  // In Next 15, calling cookies() during render must be awaited
  const cookieStore = await nextCookies();

  return createServerClient(URL, KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        } catch {}
      },
    },
  });
}

/**
 * Use in Route Handlers (e.g. /app/[...]/route.ts).
 * Returns { supabase, response } — return `response` from your handler so
 * any auth cookie updates persist.
 */
export function getRouteHandlerSupabase(req: NextRequest, res?: NextResponse) {
  const response = res ?? new NextResponse();

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      get(name: string) {
        // NextRequest exposes a cookies API in App Router
        try {
          return req.cookies.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  return { supabase, response };
}
