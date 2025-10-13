import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ClipboardCheck,
  Award,
  Users,
  HardHat,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Midlertidigt personale | Dansk Arbejdskraft',
  description:
    'Dygtige medarbejdere on-demand til korte indsatser, nathold eller weekenddækning. Fuld compliance og klar til opstart på pladsen.',
};

export default function Page() {
  return (
    <main className="relative mx-auto max-w-4xl px-4 py-16 md:py-24">
      {/* Dekorative bløde blobs (subtile, bag indhold) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-[72px]" />
        <div className="absolute -right-20 bottom-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-[72px]" />
      </div>

      {/* Header */}
      <header className="mb-10">
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy">Midlertidigt personale</h1>

        <p className="mt-3 max-w-3xl text-gray-700">
          Hold jeres projekt på tidsplanen med vores egne forhåndsgodkendte teams og et stort netværk
          af dygtige folk, der er klar til at løse opgaver. Vi styrer alt in-house, så I får
          ensartet kvalitet og tydelig kommunikation. Vi håndterer screening, smidig onboarding,
          traditionelle og digitale timesedler med enkel rapportering så I kan fokusere på
          leverancen i stedet for papirarbejde. Fortæl os, hvad I har brug for og hvornår, så matcher
          vi jer med de rette fagfolk til opgaven.
        </p>

        {/* Erfaring – highlights */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ExperiencePill icon={<Award className="h-4 w-4" />} text="5+ år med rekruttering af faglærte" />
          <ExperiencePill icon={<Users className="h-4 w-4" />} text="Kerneteam med 20+ år på byggepladser" />
          <ExperiencePill icon={<HardHat className="h-4 w-4" />} text="Specialister og multikompetente profiler (5–10+ år)" />
        </div>
      </header>

      {/* To-kolonne layout */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Hvor det giver mest værdi */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Hvor det giver mest værdi</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Fleksibelt og med kort varsel',
              'Vikardækning og spidsbelastninger',
              'Adgang til stor pulje af faglærte',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          {/* Ekstra kontekst */}
          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Vores proces prioriterer effektivitet, sikkerhed, dokumentation og match til pladsen,
            så jeres formand kan starte vagten uden forsinkelser.
          </div>
        </article>

        {/* Det får I */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Det får I</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Dygtige medarbejdere, der trives med krævende, praktisk arbejde',
              'Medarbejdere med adgang til smart tidsregistrering',
              'Én samlet faktura og 100 % compliance',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          {/* Ekstra kontekst */}
          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Mange af vores medarbejdere er specialister inden for deres fag, mens andre er
            multikompetente profiler på tværs af discipliner — og andre igen støtter der, hvor
            behovet er størst.
          </div>
        </article>
      </section>

      {/* “Sådan bemander vi hurtigt” */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-navy">Sådan bemander vi hurtigt</h3>
        </div>
        <p className="text-sm text-gray-700">
          Vores styrke er skala og fastholdelse. Vi investerer i vores folk og behandler dem ordentligt,
          derfor bliver de hos os. Det giver en aktiv pulje af dygtige medarbejdere og specialister,
          der er klar til at træde til. Når I sender en forespørgsel, matcher vi jeres opgave med de
          rette profiler ud fra kompetencer, tilgængelighed, pladskrav og team-fit. Vi ved også, at en
          god arbejdsplads handler lige så meget om kemi som om kompetencer — hvis nogen ikke er det
          rette match til jeres team, erstatter vi dem hurtigt og uden bøvl.
        </p>
      </div>

      {/* CTA */}
      <footer className="mt-10">
        <Link
          href="/contact/office"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Anmod om midlertidigt personale
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
