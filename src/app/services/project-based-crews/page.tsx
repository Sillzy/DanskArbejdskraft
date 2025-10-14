//src/app/services/project-based-crews/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  Sparkles,
  Users,
  HardHat,
  Hammer,
  ShieldCheck,
  ClipboardCheck,
  Waypoints,
  Workflow,
  Construction,
  Timer,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Projektbaserede hold | Dansk Arbejdskraft',
  description:
    'Fasefokuserede hold til beton, murerarbejde, fit-out og mere. Én partner, koordineret levering.',
};

export default function Page() {
  return (
    <main className="relative mx-auto max-w-4xl px-4 py-16 md:py-24">
      {/* Dekorative bløde blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-[72px]" />
        <div className="absolute -right-20 bottom-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-[72px]" />
      </div>

      {/* Header */}
      <header className="mb-10">
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy">Projektbaserede hold</h1>

        <p className="mt-3 max-w-3xl text-gray-700">
          Vi samler komplette hold med en arbejdsførende og den rette kombination til at levere et
          klart scope inden for en defineret periode. Fokus er koordinering, rene overleveringer og
          forudsigelig fremdrift. Én partner, afstemte tidsplaner og pæn dokumentation fra start
          til slut.
        </p>

        {/* Erfaring – highlights */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ExperiencePill icon={<Users className="h-4 w-4" />} text="Holdførere med 10–20+ år på pladser" />
          <ExperiencePill icon={<HardHat className="h-4 w-4" />} text="Specialister og multikompetente profiler" />
          <ExperiencePill icon={<Hammer className="h-4 w-4" />} text="Støttet af stort netværk ved spidsbelastning" />
        </div>
      </header>

      {/* To-korts layout */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Typiske opgaver */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Hammer className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Typiske opgaver</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Forskalling og armering',
              'Murer- og facadearbejde',
              'Beton- og fundamentarbejde',
              'Stålmontage og armeringsarbejde',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Hold kan skalere op eller ned efter jeres plan og kombinere vores egne ansatte med
            betroede specialister fra netværket efter behov.
          </div>
        </article>

        {/* Leveringsmodel */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Leveringsmodel</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Fast scope og pris eller timeafregning',
              'Holdfører som single point of contact',
              'Daglig rapportering og timesedler',
              'Ved behov: fotos og enkle statusnoter',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Vi afstemmer opstart, ressourcer og afhængigheder med jeres lookahead-plan og justerer
            hurtigt holdstørrelsen, hvis scope eller sekvens ændres.
          </div>
        </article>
      </section>

      {/* Samarbejde & snitflader */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Som ét team</h2>
          </div>
          <p className="text-sm text-gray-700">
            Godt holdarbejde handler om mennesker, rækkefølge og flow. Vi planlægger sammen, afstemmer
            snitflader og er enige om, hvordan vi afleverer til næste hold. Daglige standups holder
            alle på samme side og fanger udfordringer tidligt. Vi går efter en hjælpsom, respektfuld
            kultur, hvor holdene støtter hinanden og løser problemer hurtigt.
          </p>
          <ul className="mt-3 space-y-2">
            {[
              'Daglig koordinering med pladsledelse og nabofag',
              'Klare overleveringskriterier pr. zone eller etage',
              'Simpel blokkering-log og hurtig eskalationsvej',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Waypoints className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Snitflader og overleveringer</h2>
          </div>
          <p className="text-sm text-gray-700">
            Snitflader styrer kvalitet og tempo. Vi gør dem tydelige med simple checklister og
            visuelle hjælpemidler, så hver overlevering er forstået. Hvis en profil ikke passer til
            jeres teamdynamik, erstatter vi hurtigt og uden bøvl.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {[
              'Zoneklarheds-tjek',
              'Hold points og godkendelser',
              'Fælles lookahead-plan',
              'Rydning og præsentation',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Timer className="mt-0.5 h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Kultur & standarder */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Construction className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-navy">Holdkultur og standarder</h3>
        </div>
        <p className="text-sm text-gray-700">
          Vi møder forberedte, kommunikerer åbent og holder arbejdsområdet ryddeligt. Holdføreren
          sætter tempoet, tjekker detaljerne og holder planen i gang. Det handler om at være
          hjælpsom over for faget før og efter dig, så hele pladsen vinder.
        </p>
      </div>

      {/* CTA */}
      <footer className="mt-10">
        <Link
          href="/contact/office"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Book et hold
        </Link>
      </footer>
    </main>
  );
}

/* ---------- Hjælpere (server-safe) ---------- */

function ExperiencePill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-blue-100">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
        {icon}
      </span>
      <span className="leading-tight">{text}</span>
    </div>
  );
}
