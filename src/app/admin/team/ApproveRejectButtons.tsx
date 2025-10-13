// src/app/admin/team/ApproveRejectButtons.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveRejectButtons({ uid }: { uid: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const send = (status: 'approved' | 'rejected') => {
    start(async () => {
      await fetch(`/api/admin/profile-status?uid=${uid}&status=${status}`, { method: 'POST' });
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => send('approved')}
        disabled={pending}
        className="rounded bg-green-600 px-3 py-1.5 text-white text-sm disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => send('rejected')}
        disabled={pending}
        className="rounded bg-red-600 px-3 py-1.5 text-white text-sm disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
