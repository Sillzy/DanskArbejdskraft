import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Hammer,
  Ruler,
  Layers,
  ClipboardCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Murerarbejde | Dansk Arbejdskraft',
  description: 'Murerteams til facade og indvendigt arbejde, klar til stillads.',
};

export default function Page() {
  return (
    <main className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
      {/* bløde accenter */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12rem] top-20 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-16 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">Murerarbejde</h1>
        <p className="mt-4 max-w-3xl text-gray-700 md:text-lg">
          Murerteams til facade- og indvendigt arbejde. Vi følger jeres sekvens, beskytter den færdige
          overflade og holder snitflader ryddelige til næste fag. Fra lige stræk til buer og detaljer —
          vores teams arbejder rent og effektivt.
        </p>
      </header>

      {/* Delt sektion med billede + tekst */}
      <SectionSplit
        title="Facade & blokarbejde"
        icon={<Layers className="h-5 w-5 text-blue-600" />}
        bullets={[
          'Facademurværk og blokarbejde',
          'Overliggere, buer og detaljearbejde',
          'Beskyttelse og pæn præsentation',
        ]}
        note="Vi koordinerer adgang, materialer og stilladsbehov, så holdet er produktivt, og facaden forbliver beskyttet."
        image={{ src: '/Marketing/Bricklaying1.jpg', alt: 'Facademurværk på byggeplads' }}
      />

      {/* Præcision & finish (tekst først, intet ekstra foto) */}
      <section className="grid items-center gap-8 py-6 md:grid-cols-12 md:gap-12 md:py-10">
        <div className="md:col-span-6">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-navy">Præcision og finish</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {[
                'Stramme fuger, lodrette linjer og ensartede skifter',
                'Håndtering af mørtel og vejrbeskyttelse',
                'Fugearbejde, rengøring og overflader klar til aflevering',
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              Godt murværk handler om detaljer og omhu. Vi holder tempoet uden at gå på kompromis
              med overfladen.
            </p>
          </article>
        </div>

        <div className="md:col-span-6">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-navy">Koordinering & flow</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {[
                'Enkle daglige noter og fremdriftsbilleder',
                'Klare overleveringer med nabofag',
                'Timesedler og eksporterbare oversigter',
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              Vi sikrer materialeflow og holder området ryddeligt, så efterfølgende arbejde kan starte
              uden forsinkelse.
            </p>
          </article>
        </div>
      </section>

      {/* Kompetencegrid */}
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Capability
          icon={<Hammer className="h-5 w-5 text-blue-600" />}
          title="Typiske opgaver"
          items={[
            'Facademurværk og indvendige skillevægge',
            'Blokarbejde, overliggere og lysninger',
            'Fuge, rengøring og beskyttelse',
          ]}
        />
        <Capability
          icon={<Truck className="h-5 w-5 text-blue-600" />}
          title="Logistik"
          items={[
            'Koordinering af materialer og stillads',
            'Opstilling og just-in-time leverancer',
            'Affaldshåndtering og pladsens orden',
          ]}
        />
        <Capability
          icon={<ClipboardCheck className="h-5 w-5 text-blue-600" />}
          title="Kontrol"
          items={[
            'Justering og kvalitetskontrol',
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
          Book murerteam <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </footer>
    </main>
  );
}

/* ---------- Hjælpere (server-safe) ---------- */

function SectionSplit({
  title,
  icon,
  bullets,
  note,
  image,
}: {
  title: string;
  icon: React.ReactNode;
  bullets: string[];
  note?: string;
  image: { src: string; alt: string };
}) {
  return (
    <section className="grid items-center gap-8 py-6 md:grid-cols-12 md:gap-12 md:py-10">
      {/* Billede */}
      <div className="order-2 md:order-1 md:col-span-7">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative w-full pt-[66%] md:pt-[62%]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Tekst */}
      <div className="order-1 md:order-2 md:col-span-5">
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
