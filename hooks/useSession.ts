//hooks/useSession.ts
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type SessionT = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

export function useSession() {
  const [session, setSession] = useState<SessionT>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return session;
}
