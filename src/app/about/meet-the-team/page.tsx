// src/app/about/meet-the-team/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/../lib/supabaseClient';

const AVATAR_BUCKET = 'avatars';

type Worker = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  team_title: string | null;
  email: string | null;
  avatar_url: string | null; // storage path or full URL
};

const CORE_TEAM = [
  {
    id: 'alex-m',
    name: 'Alex M.',
    title: 'Direktør',
    email: 'Alex@danskarbejdskraft.dk',
    avatar: '/Alex M.png',
  },
  {
    id: 'daniel-m',
    name: 'Daniel M.',
    title: 'Formand',
    email: 'Daniel@danskarbejdskraft.dk',
    avatar: '/Daniel M.png',
  },
  {
    id: 'alexandra-m',
    name: 'Alexandra M.',
    title: 'Økonomi',
    email: 'Alexandra@danskarbejdskraft.dk',
    avatar: '/Alexandra M.png',
  },
];

/** Format: "Dane K." (fallbacks to single name or '—'). */
function formatName(first?: string | null, last?: string | null) {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  const initial = l ? `${l.charAt(0).toUpperCase()}.` : '';
  const out = [f, initial].filter(Boolean).join(' ').trim();
  return out || '—';
}

/** If avatar_url is a storage path, sign it; if it’s already a URL, keep it. */
async function withSignedAvatars(rows: Worker[]) {
  const needsSign = rows.filter(
    (r) => r.avatar_url && !/^https?:\/\//i.test(r.avatar_url)
  );
  if (needsSign.length === 0) return rows;

  const paths = needsSign.map((r) => r.avatar_url!) as string[];
  const { data: signed, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrls(paths, 3600);

  if (error) return rows;

  const map = new Map<string, string>();
  paths.forEach((p, i) => {
    const url = signed?.[i]?.signedUrl;
    if (url) map.set(p, url);
  });

  return rows.map((r) =>
    r.avatar_url && map.has(r.avatar_url)
      ? { ...r, avatar_url: map.get(r.avatar_url)! }
      : r
  );
}

export default function MeetTheTeamPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Load approved workers
  async function loadWorkers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'user_id, first_name, last_name, team_title, email, avatar_url, profile_status'
      )
      .eq('profile_status', 'approved')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('profiles query error:', error);
      setWorkers([]);
      setLoading(false);
      return;
    }

    const list = await withSignedAvatars((data ?? []) as Worker[]);
    setWorkers(list);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadWorkers();
      if (cancelled) return;

      // Realtime updates
      const channel = supabase
        .channel('meet_the_team_profiles')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          async (payload) => {
            const newRow: any = payload.new;
            const oldRow: any = payload.old;

            const becameApproved =
              payload.eventType === 'UPDATE' &&
              oldRow?.profile_status !== 'approved' &&
              newRow?.profile_status === 'approved';

            const leftApproved =
              payload.eventType === 'UPDATE' &&
              oldRow?.profile_status === 'approved' &&
              newRow?.profile_status !== 'approved';

            const relevantUpdate =
              payload.eventType === 'UPDATE' &&
              newRow?.profile_status === 'approved' &&
              ['first_name', 'last_name', 'team_title', 'email', 'avatar_url'].some(
                (k) => newRow?.[k] !== oldRow?.[k]
              );

            const newApprovedInsert =
              payload.eventType === 'INSERT' &&
              newRow?.profile_status === 'approved';

            const removedApprovedDelete =
              payload.eventType === 'DELETE' &&
              oldRow?.profile_status === 'approved';

            if (
              becameApproved ||
              leftApproved ||
              relevantUpdate ||
              newApprovedInsert ||
              removedApprovedDelete
            ) {
              await loadWorkers();
            }
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        supabase.removeChannel(channel);
      };
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-10 text-4xl font-bold text-slate-900">Mød teamet</h1>

      {/* Intro (before core team) */}
      <section className="mb-10">
        <p className="text-slate-700 leading-7">
          Vi er et hold, der selv har stået i marken i mere end 10&nbsp;år. Undervejs
          har vi samlet et stærkt netværk af dygtige folk, som vi arbejder tæt sammen med.
          Vi er i vækst og udvider løbende vores kapacitet. I tidligere stillinger og projekter
          har vi haft ansvar for over 80 medarbejdere ad gangen – erfaring, struktur og kvalitet
          er derfor fundamentet for det, vi leverer i dag.
        </p>
      </section>

      {/* Core team */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Kerneteam</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_TEAM.map((m) => (
            <Card
              key={m.id}
              name={m.name}
              title={m.title}
              email={m.email}
              avatar={m.avatar}
            />
          ))}
        </div>
      </section>

      {/* Skilled workers */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Medarbejdere</h2>
        {loading ? (
          <p className="text-slate-500">Indlæser…</p>
        ) : workers.length === 0 ? (
          <p className="text-slate-500">Ingen medarbejdere offentliggjort endnu.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((w) => (
              <Card
                key={w.user_id}
                name={formatName(w.first_name, w.last_name)}
                // No title for skilled workers (intentionally omitted)
                email={w.email ?? undefined}
                avatar={w.avatar_url}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Card({
  name,
  title,
  email,
  avatar,
}: {
  name: string;
  title?: string;
  email?: string | null;
  avatar: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-slate-100">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={64}
            height={64}
            className="h-16 w-16 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Intet foto
          </div>
        )}
      </div>
      <div className="font-semibold text-slate-900">{name}</div>
      {title ? <div className="text-sm text-slate-600">{title}</div> : null}

      {email && (
        <div className="mt-2 text-sm">
          <a
            href={`mailto:${email}`}
            className="text-blue-600 underline-offset-2 hover:underline"
          >
            {email}
          </a>
        </div>
      )}
    </div>
  );
}
