import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Construction,
  HardHat,
  Gauge,
  Wrench,
  ClipboardCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Maskinførere til tungt materiel | Dansk Arbejdskraft',
  description: 'Gravemaskiner, læssemaskiner, tromler og kraner med erfarne operatører.',
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
        <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">
          Maskinførere til tungt materiel
        </h1>
        <p className="mt-4 max-w-3xl text-gray-700 md:text-lg">
          Operatører til gravemaskiner, læssemaskiner, tromler og løfteopgaver på anlægs- og
          byggepladser. Vi følger jeres sekvens, holder arbejdsstederne i gang og arbejder med
          sikkerhed først.
        </p>
      </header>

      {/* Række 1 */}
      <SectionSplit
        title="Jordarbejde & pladsforberedelse"
        icon={<Construction className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Masseudgravning, planering og rendegravning',
          'Fundamenter, tilbagefyldning og komprimeringssupport',
          'Vejopbygning, plader og drænforberedelse',
        ]}
        note="Vi koordinerer med opmåling og jordhold for at holde niveauer præcise og fremdriften forudsigelig."
        image={{
          src: '/Marketing/HeavyMachineryOperators1.jpg',
          alt: 'Gravemaskine og læssemaskine i arbejde',
        }}
      />

      {/* Række 2 (omvendt) */}
      <SectionSplit
        reverse
        title="Redskaber & præcisionsarbejde"
        icon={<Wrench className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Skovle, hammere, sneglebor og gafler',
          'Finplanering omkring installationer og konstruktioner',
          'Materialehåndtering og løfteassistance',
        ]}
        note="Erfarne operatører med kendskab til mange typer redskaber til præcise opgaver nær følsomme områder."
        image={{
          src: '/Marketing/HeavyMachineryOperators2.jpg',
          alt: 'Operatør bruger redskab til præcisionsarbejde',
        }}
      />

      {/* Kompetencestrimmel */}
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Capability
          icon={<Gauge className="h-5 w-5 text-blue-600" />}
          title="Typisk scope"
          items={[
            'Anlægs- og byggepladsopgaver',
            'Læsn, kør og komprimer',
            'Løfteplaner med teleskoplæsser-support',
          ]}
        />
        <Capability
          icon={<ClipboardCheck className="h-5 w-5 text-blue-600" />}
          title="Kontrol"
          items={[
            'Daglige walkarounds og simple logbøger',
            'Klar signalering (banksman) og kommunikation',
            'Timesedler og eksporterbare oversigter',
          ]}
        />
        <Capability
          icon={<HardHat className="h-5 w-5 text-blue-600" />}
          title="Parathed"
          items={[
            'Personale klar til pladsintroduktion',
            'Dag-, aften- og nathold',
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
          Bestil maskinførere <ArrowRight className="ml-2 h-4 w-4" />
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
        'py-6 md:py-10', // generøs lodret luft
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
              priority={title === 'Jordarbejde & pladsforberedelse'}
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
