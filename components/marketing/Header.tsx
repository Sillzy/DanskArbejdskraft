// components/marketing/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation'; // ⬅️ add usePathname
import { useEffect, useState } from 'react';
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/../hooks/useSession';
import { supabase } from '@/../lib/supabaseClient';

type Item = { label: string; href: string; desc?: string };

const services: Item[] = [
  { label: 'Midlertidigt personale', href: '/services/temporary-staff' },
  { label: 'Projektbaserede hold', href: '/services/project-based-crews' },
  { label: 'Entrepriseprojekt', href: '/services/enterprise-project' },
  { label: 'Smart tidsregistrering', href: '/services/smart-time-registration' },
];

const fields: Item[] = [
  { label: 'Beton & fundament', href: '/industries/concrete-foundation' },
  { label: 'Murerarbejde', href: '/industries/bricklaying' },
  { label: 'Truckførere', href: '/industries/forklift-drivers' },
  { label: 'Maskinførere til tungt materiel', href: '/industries/heavy-machinery-operators' },
  { label: 'VVS-montør', href: '/industries/plumber' },
  { label: 'Tagdækker', href: '/industries/roofer' },
  { label: 'Svejsere', href: '/industries/welder' },
  { label: 'Stålmontør', href: '/industries/ironworker' },
  { label: 'Tømrerarbejde', href: '/industries/carpentry' },
  { label: 'Isolatør', href: '/industries/insulation-installer' },
];

const about: Item[] = [{ label: 'Mød teamet', href: '/about/meet-the-team' }];
const contact: Item[] = [{ label: 'Kontor', href: '/contact/office' }];

function Brand({ size = 48 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center" prefetch={false}>
      <Image
        src="/Logo.png"
        alt="Dansk Arbejdskraft"
        width={size * 4}
        height={size}
        priority
        className="h-10 w-auto md:h-12"
      />
      <span className="sr-only">Dansk Arbejdskraft</span>
    </Link>
  );
}

function NavMenu({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="inline-flex items-center gap-1 text-gray-700 hover:text-navy"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        type="button"
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl z-50"
            role="menu"
          >
            <ul className="py-2">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                    href={it.href}
                    role="menuitem"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                  >
                    <div className="font-medium text-gray-900">{it.label}</div>
                    {it.desc && <div className="text-xs text-gray-500">{it.desc}</div>}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();               // ⬅️ where are we?

  const showSpacer = pathname !== '/';          // ⬅️ no spacer on the homepage hero

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase.rpc('is_admin', { p_uid: session.user.id });
      if (!cancelled) setIsAdmin(!error && !!data);
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const mobileSection = (title: string, items: Item[]) => (
    <div className="border-t border-gray-200 bg-white">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
        onClick={() => setMobileSub(mobileSub === title ? null : title)}
        type="button"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition ${mobileSub === title ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {mobileSub === title && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-2 pb-2 bg-white"
          >
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  href={it.href}
                  prefetch={false}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Fixed header */}
      <header
        className="
          fixed top-0 inset-x-0 z-50
          bg-white shadow-sm border-b border-slate-200
          supports-[backdrop-filter]:bg-white/90 supports-[backdrop-filter]:backdrop-blur
        "
        role="banner"
      >
        <nav className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4">
          <Brand />

          <div className="hidden items-center gap-8 md:flex">
            <NavMenu label="Ydelser" items={services} />
            <NavMenu label="Fagområder" items={fields} />
            <NavMenu label="Om os" items={about} />
            <NavMenu label="Kontakt" items={contact} />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    prefetch={false}
                    className="rounded-lg border border-amber-500 px-5 py-2 text-amber-600 hover:bg-amber-50"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  prefetch={false}
                  className="rounded-lg border border-blue-500 px-5 py-2 text-blue-500 hover:bg-blue-50"
                >
                  Min side
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg bg-blue-500 px-5 py-2 text-white hover:bg-blue-600"
                  type="button"
                >
                  Log ud
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup?next=/dashboard/onboarding"
                  prefetch={false}
                  className="rounded-lg border border-blue-500 px-5 py-2 text-blue-500 hover:bg-blue-50"
                >
                  Bliv medarbejder
                </Link>
                <Link
                  href="/login"
                  prefetch={false}
                  className="rounded-lg bg-blue-500 px-5 py-2 text-white hover:bg-blue-600"
                >
                  Log ind
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            aria-label="Åbn menu"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {/* Spacer only on pages that need it */}
      {showSpacer && <div className="h-16 md:h-20" />}

      {/* Mobile overlay + sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed right-0 top-0 z-50 w-full max-w-sm h-dvh overflow-y-auto bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-4">
                <Brand size={32} />
                <button
                  aria-label="Luk menu"
                  onClick={() => setMobileOpen(false)}
                  type="button"
                  className="p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {mobileSection('Ydelser', services)}
              {mobileSection('Fagområder', fields)}
              {mobileSection('Om os', about)}
              {mobileSection('Kontakt', contact)}

              <div className="border-t px-4 py-4 bg-white">
                <div className="flex flex-col gap-3">
                  {session ? (
                    <>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          prefetch={false}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-lg border border-amber-500 px-5 py-2 text-center text-amber-600 hover:bg-amber-50"
                        >
                          Admin
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg border border-blue-500 px-5 py-2 text-center text-blue-500 hover:bg-blue-50"
                      >
                        Profil
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          logout();
                        }}
                        className="rounded-lg bg-blue-500 px-5 py-2 text-center text-white hover:bg-blue-600"
                        type="button"
                      >
                        Log ud
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg bg-blue-500 px-5 py-2 text-center text-white hover:bg-blue-600"
                      >
                        Log ind
                      </Link>
                      <Link
                        href="/signup?next=/dashboard/onboarding"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg border border-blue-500 px-5 py-2 text-center text-blue-500 hover:bg-blue-50"
                      >
                        Bliv medarbejder
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
