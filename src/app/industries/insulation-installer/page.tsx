import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Wind,
  Thermometer,
  Ruler,
  ClipboardCheck,
  Wrench,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Isoleringsmontører | Dansk Arbejdskraft',
  description: 'Hold til termisk og akustisk isolering af bygningers klimaskærm.',
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
        <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">Isoleringsmontører</h1>
        <p className="mt-4 max-w-3xl text-gray-700 md:text-lg">
          Indvendige og udvendige isoleringsteams med hurtig mobilisering. Vi installerer termiske og
          akustiske løsninger, beskytter luft- og dampspærrer og holder snitflader ryddelige, så
          efterfølgende arbejde kan starte uden forsinkelse.
        </p>
      </header>

      {/* Række 1 */}
      <SectionSplit
        title="Termiske & akustiske systemer"
        icon={<Thermometer className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Mineraluld, PIR- og skumsystemer',
          'Isolering af hulmur, tag og gulv',
          'Akustikbatts og lydreduktion',
        ]}
        note="Vi iscenesætter materialer pr. zone og sekvens og holder styr på udskæringer, affald og støv."
        image={{ src: '/Marketing/InsulationInstaller1.jpg', alt: 'Installation af termisk og akustisk isolering' }}
      />

      {/* Række 2 (omvendt) */}
      <SectionSplit
        reverse
        title="Lufttæthed & detaljering"
        icon={<Wind className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Dampspærrer og lufttætte tapes',
          'Gennemføringer og samlingsdetaljer',
          'Fugthåndtering og beskyttelse',
        ]}
        note="Opmærksomhed på snitflader bevarer ydeevnen og sparer omarbejde senere."
        image={{ src: '/Marketing/InsulationInstaller2.jpg', alt: 'Dampspærre og lufttætte detaljer' }}
      />

      {/* Kompetencestrimmel */}
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Capability
          icon={<Ruler className="h-5 w-5 text-blue-600" />}
          title="Typisk scope"
          items={[
            'Vægge, tage, gulve og teknikrum',
            'Lukning af hulrum og lysninger',
            'Akustiske skillevægge og lofter',
          ]}
        />
        <Capability
          icon={<ClipboardCheck className="h-5 w-5 text-blue-600" />}
          title="Kontrol"
          items={[
            'Enkle daglige noter og QA-fotos',
            'Status pr. zone eller etage',
            'Timesedler og eksporterbare oversigter',
          ]}
        />
        <Capability
          icon={<Wrench className="h-5 w-5 text-blue-600" />}
          title="Parathed"
          items={[
            'Pladsklare teams med arbejdende formand',
            'Ryddelig staging og affaldshåndtering',
            'Opskalering i spidsfaser',
          ]}
        />
      </section>

      {/* CTA */}
      <footer className="mt-12">
        <Link
          href="/contact/office"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Bestil montører <ArrowRight className="ml-2 h-4 w-4" />
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
              priority={title === 'Termiske & akustiske systemer'}
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
