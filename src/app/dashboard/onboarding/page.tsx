// src/app/dashboard/onboarding/page.tsx
import { Suspense } from 'react';
import OnboardingClient from './onboarding-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-[60vh] flex items-center justify-center px-4 py-12 text-slate-600">Loading…</main>}>
      <OnboardingClient />
    </Suspense>
  );
}
