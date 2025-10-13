// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRouteHandlerSupabase } from '@/../lib/supabase-server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') ?? '/dashboard';
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');

  // If the provider sent an error, bounce to login with message.
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDesc ?? error)}&next=${encodeURIComponent(next)}`,
        req.url
      )
    );
  }

  // Prepare the final redirect
  const redirectResponse = NextResponse.redirect(new URL(next, req.url));

  // Wire Supabase cookies to this response
  const { supabase, response } = getRouteHandlerSupabase(req, redirectResponse);

  // Exchange the code for a session (sets auth cookies on `response`)
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Sign-in failed')}&next=${encodeURIComponent(next)}`, req.url)
      );
    }
  }

  return response;
}
