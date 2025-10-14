//hooks/useIsAdmin
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/../lib/supabaseClient';

export function useIsAdmin(userId?: string | null) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!userId) { setIsAdmin(false); return; }

    supabase.rpc('is_admin', { p_uid: userId })
      .then(({ data, error }) => {
        if (!cancelled) setIsAdmin(Boolean(data) && !error);
      });

    return () => { cancelled = true; };
  }, [userId]);

  return isAdmin;
}
