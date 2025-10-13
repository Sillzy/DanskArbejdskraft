// src/app/(auth)/login/signup/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/../lib/supabaseClient';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.916 31.668 29.392 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.84 1.153 7.957 3.043l5.657-5.657C34.91 5.053 29.708 3 24 3 16.318 3 9.69 7.337 6.306 14.691z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.357 16.114 18.832 13 24 13c3.059 0 5.84 1.153 7.957 3.043l5.657-5.657C34.91 5.053 29.708 3 24 3 16.318 3 9.69 7.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 43c5.313 0 10.188-2.031 13.844-5.344l-6.391-5.406C29.346 33.766 26.846 35 24 35c-5.365 0-9.9-3.354-11.594-8.052l-6.52 5.021C8.261 38.623 15.587 43 24 43z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.087 3.206-3.566 5.677-6.85 6.929l.006-.004 6.391 5.406C36.41 41.02 43.5 36.5 43.5 23c0-1.34-.138-2.646-.389-3.917z"/>
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard/onboarding';

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const shouldRedirectTo = useMemo(() => next, [next]);
  const safeReplace = (to: string) => { if (to && to !== pathname) router.replace(to); };

  // one-time check: if already logged in, go to next
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) safeReplace(shouldRedirectTo);
    });
    return () => { mounted = false; };
  }, [pathname, shouldRedirectTo, router]);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!email || !pw || !pw2) return setErr('Please complete all fields.');
    if (pw !== pw2) return setErr('Passwords do not match.');
    if (pw.length < 8) return setErr('Password must be at least 8 characters.');

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
            : undefined,
      },
    });
    setLoading(false);

    if (error) return setErr(error.message);

    if (!data.session) {
      setMsg('Check your inbox to confirm your email. After confirming, you’ll be redirected.');
    } else {
      router.replace(next);
      router.refresh();
    }
  };

  const signUpWithGoogle = async () => {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : undefined;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  };

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={signUp} className="rounded-2xl border bg-white p-6 space-y-4">
        {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        {msg && <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-2 ring-blue-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pw" className="text-sm font-medium text-slate-700">Create password</label>
          <input
            id="pw"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-2 ring-blue-200"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pw2" className="text-sm font-medium text-slate-700">Confirm password</label>
          <input
            id="pw2"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-2 ring-blue-200"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        <div className="relative my-2 text-center">
          <span className="bg-white px-3 text-xs text-slate-500 relative z-10">or</span>
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t" />
        </div>

        <button
          type="button"
          onClick={signUpWithGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold hover:bg-slate-50"
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>

        <p className="pt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <a className="text-blue-600 underline-offset-2 hover:underline" href="/login">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
