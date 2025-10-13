// lib/supabase-browser.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Uses @supabase/ssr to mirror session into cookies automatically (no cookies option needed).
 * This lets middleware see you as logged-in right after password login.
 */
export const supabaseBrowser = createBrowserClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
