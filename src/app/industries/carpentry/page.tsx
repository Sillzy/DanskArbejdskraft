import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Hammer,
  Ruler,
  ClipboardCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tømrerarbejde | Dansk Arbejdskraft',
  description: 'Tømrere til råhus og finish – rammer, døre og fit-out.',
};

export default function Page() {
  return (
    <main className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
      {/* Subtile baggrundsaccenter */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12rem] top-20 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-16 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">Tømrerarbejde</h1>
        <p className="mt-4 max-w-3xl text-gray-700 md:text-lg">
          Fra bærende konstruktioner til indvendig indretning og de sidste detaljer. Vores tømrerteams
          arbejder rent, koordinerer med nabofag og holder tempoet uden at gå på kompromis med finish.
        </p>
      </header>

      {/* Række 1 */}
      <SectionSplit
        title="Konstruktion & første fix"
        icon={<Hammer className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Skeletvægge, bjælkelag, dæk og pladebeklædning',
          'Tagkonstruktioner, trapper og midlertidige arbejder',
          'Pladsopstart, afskærmning og beskyttelser',
        ]}
        note="Vi følger jeres sekvens og holder snitflader ryddelige, så efterfølgende fag kan starte til tiden."
        image={{ src: '/Marketing/Carpentry1.jpg', alt: 'Konstruktionssnedkeri på byggeplads' }}
      />

      {/* Række 2 (omvendt) */}
      <SectionSplit
        reverse
        title="Indvendig indretning & finish"
        icon={<Ruler className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Dørsæt, fodlister, gerichter og lysninger',
          'Køkkener, garderober og montering af specialsnedkeri',
          'Afhjælpning (snagging), punchlister og ren aflevering',
        ]}
        note="Detaljerne betyder noget. Vi beskytter færdige overflader og afleverer områder klar til gennemgang."
        image={{ src: '/Marketing/Carpentry2.jpg', alt: 'Indvendig tømrer-fit-out' }}
      />

      {/* Kompetencestrimmel */}
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Capability
          icon={<Hammer className="h-5 w-5 text-blue-600" />}
          title="Typisk scope"
          items={[
            'Rammer, gulve, tage og trapper',
            'Første fix og andet fix tømrerarbejde',
            'Finish og forberedelse til aflevering',
          ]}
        />
        <Capability
          icon={<Truck className="h-5 w-5 text-blue-600" />}
          title="Mobilisering"
          items={[
            'Pladsklare teams med arbejdende formand',
            'Materialeflow og staging-koordinering',
            'Skalerbar bemanding efter tidsplanen',
          ]}
        />
        <Capability
          icon={<ClipboardCheck className="h-5 w-5 text-blue-600" />}
          title="Kontrol"
          items={[
            'Daglige noter og ryddelig dokumentation',
            'Enkel status pr. zone eller etage',
            'Ren overlevering til næste fag',
          ]}
        />
      </section>

      {/* CTA */}
      <footer className="mt-12">
        <Link
          href="/contact/office"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Bestil tømrere <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </footer>
    </main>
  );
}

/* ---------------- Hjælpere (server-safe) ---------------- */

function SectionSplit({
  title,
  icon,
  bullets,
  note,
  image,
  reverse = false,
}: {
  title: string;
  icon: React.ReactNode;
  bullets: string[];
  note?: string;
  image: { src: string; alt: string };
  reverse?: boolean;
}) {
  return (
    <section
      className={[
        'grid items-center gap-8 md:gap-12',
        'md:grid-cols-12',
        'py-6 md:py-10',
      ].join(' ')}
    >
      {/* Billedkolonne */}
      <div className={reverse ? 'order-2 md:order-2 md:col-span-7' : 'order-2 md:order-1 md:col-span-7'}>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative w-full pt-[66%] md:pt-[62%]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
              priority={title === 'Konstruktion & første fix'}
            />
          </div>
        </div>
      </div>

      {/* Tekstkort-kolonne */}
      <div className={reverse ? 'order-1 md:order-1 md:col-span-5' : 'order-1 md:order-2 md:col-span-5'}>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold text-navy">{title}</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{b}</span>
              </li>
            ))}
          </ul>
          {note ? <p className="mt-4 text-sm text-gray-600">{note}</p> : null}
        </article>
      </div>
    </section>
  );
}

function Capability({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold text-navy">{title}</h3>
      </div>
      <ul className="mt-2 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
