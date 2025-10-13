// src/app/(auth)/signup/page.tsx
import { Suspense } from 'react';
import SignUpClient from './signup-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignUpClient />
    </Suspense>
  );
}
