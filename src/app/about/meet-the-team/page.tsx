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
  phone_number: string | null;
  avatar_url: string | null;
};

const CORE_TEAM = [
  { id: 'alex-m', name: 'Alex M.', title: 'Direktør', email: 'Alex@danskarbejdskraft.dk', phone: null as string | null, avatar: '/Alex M.png' },
  { id: 'daniel-m', name: 'Daniel M.', title: 'Formand',  email: 'Daniel@danskarbejdskraft.dk', phone: null as string | null, avatar: '/Daniel M.png' },
  { id: 'alexandra-m', name: 'Alexandra M.', title: 'Økonomi', email: 'Alexandra@danskarbejdskraft.dk', phone: null as string | null, avatar: '/Alexandra M.png' },
];

/** Formater fornavn + efternavnsinitial: "Dane K." (falder tilbage til enkelt navn eller '—'). */
function formatName(first?: string | null, last?: string | null) {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  const initial = l ? `${l.charAt(0).toUpperCase()}.` : '';
  const formatted = [f, initial].filter(Boolean).join(' ').trim();
  return formatted || '—';
}

/** Hvis avatar_url er en storage-sti, signér den; hvis det allerede er en URL, lad den være. */
async function withSignedAvatars(rows: Worker[]) {
  const needsSign = rows.filter(r => r.avatar_url && !/^https?:\/\//i.test(r.avatar_url));
  if (needsSign.length === 0) return rows;

  const paths = needsSign.map(r => r.avatar_url!) as string[];
  const { data: signed } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrls(paths, 3600);

  const map = new Map<string, string>();
  paths.forEach((p, i) => {
    const url = signed?.[i]?.signedUrl;
    if (url) map.set(p, url);
  });

  return rows.map(r =>
    r.avatar_url && map.has(r.avatar_url) ? { ...r, avatar_url: map.get(r.avatar_url)! } : r
  );
}

export default function MeetTheTeamPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, team_title, email, phone_number, avatar_url')
        .eq('team_approved', true)
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
    })();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-10 text-4xl font-bold text-slate-900">Mød teamet</h1>

      {/* Kerne-teamet */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_TEAM.map(m => (
            <Card key={m.id} name={m.name} title={m.title} email={m.email} phone={m.phone} avatar={m.avatar} />
          ))}
        </div>
      </section>

      {/* Faglærte medarbejdere */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Medarbejdere</h2>
        {loading ? (
          <p className="text-slate-500">Indlæser…</p>
        ) : workers.length === 0 ? (
          <p className="text-slate-500">Ingen medarbejdere offentliggjort endnu.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map(w => (
              <Card
                key={w.user_id}
                name={formatName(w.first_name, w.last_name)}  // ← kun efternavnsinitial
                title={w.team_title ?? 'Faglært'}
                email={w.email ?? undefined}
                phone={w.phone_number ?? undefined}
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
  phone,
  avatar,
}: {
  name: string;
  title: string;
  email?: string | null;
  phone?: string | null;
  avatar: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-slate-100">
        {avatar ? (
          <Image src={avatar} alt={name} width={64} height={64} className="h-16 w-16 object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Intet foto
          </div>
        )}
      </div>
      <div className="font-semibold text-slate-900">{name}</div>
      <div className="text-sm text-slate-600">{title}</div>

      {email && (
        <div className="mt-2 text-sm">
          <a href={`mailto:${email}`} className="text-blue-600 underline-offset-2 hover:underline">
            {email}
          </a>
        </div>
      )}
      {phone && (
        <div className="text-sm">
          <a href={`tel:${phone}`} className="text-slate-700 underline-offset-2 hover:underline">
            {phone}
          </a>
        </div>
      )}
    </div>
  );
}
