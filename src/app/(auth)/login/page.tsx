// src/app/(auth)/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './login-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
