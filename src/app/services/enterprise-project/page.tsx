import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  ClipboardCheck,
  CheckCircle2,
  Layers,
  Server,
  Lock,
  FileStack,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Entrepriseprojekt | Dansk Arbejdskraft',
  description:
    'Én koordineret partner på tværs af flere fag og pladser. Styring, rapportering og levering i enterprise-skala.',
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
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy">Entrepriseprojekt</h1>

        <p className="mt-3 max-w-3xl text-gray-700">
          Ved komplekse opgaver, som spænder over flere fag, pladser og tidslinjer, agerer vi som én
          partner, der planlægger, bemander og koordinerer leverancen fra start til slut. I får
          struktureret styring, ensartet kvalitet på tværs af hold og klar rapportering, så arbejdet
          skrider frem uden friktion.
        </p>

        {/* Erfaring – highlights */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ExperiencePill icon={<Users className="h-4 w-4" />} text="Program- og pladsledere med 10–20+ år" />
          <ExperiencePill icon={<Layers className="h-4 w-4" />} text="Planlægning på tværs af fag og snitflader" />
          <ExperiencePill icon={<Building2 className="h-4 w-4" />} text="Én partner på tværs af pladser og faser" />
        </div>
      </header>

      {/* To-korts layout */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Hvor dette passer ind */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Hvor dette passer ind</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Udrulninger på flere lokationer og lange programmer',
              'Scope på tværs af flere fag og overleveringer',
              'Stramme tidsplaner med behov for hurtig mobilisering',
              'Høje dokumentationsbehov og synlighed for interessenter',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Vi kombinerer egne medarbejdere med betroede specialister fra vores netværk for at nå
            mål for scope, kvalitet og tidsplan på tværs af lokationer.
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
              'Én kontrakt og én ansvarlig partner',
              'Programstyring med tydelig kadence',
              'Lookahead-planlægning og kapacitetsstyring',
              'Daglige noter, timesedler og enkel status',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Vi afstemmer ressourcer og snitflader med jeres masterplan og justerer hurtigt, hvis
            prioriteter ændres.
          </div>
        </article>
      </section>

      {/* Samarbejde & styring */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Samarbejde i stor skala</h2>
          </div>
          <p className="text-sm text-gray-700">
            Enterprise-leverance er en holdsport. Vi planlægger med jeres PMO og pladsledere,
            tydeliggør snitflader og aftaler, hvordan arbejdet flyttes mellem fag. Daglig
            koordinering holder holdene på linje, synliggør udfordringer tidligt og beskytter
            tidsplanen. Passer en profil ikke til teamets dynamik, erstatter vi hurtigt og uden
            bøvl.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {[
              'Daglige tjek med pladsledelse og nabofag',
              'Klare overleveringskriterier og zoneklarhed',
              'Blokkeringslog med hurtig eskalation',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Rapportering og styring</h2>
          </div>
          <p className="text-sm text-gray-700">
            I får den synlighed, I behøver, uden ekstra administration. Vi leverer enkle dashboards
            og eksporterbare oversigter, så interessenter kan følge fremdrift, timer og omkostninger
            med et blik.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {[
              'Daglige statusnoter og lookahead',
              'Timesedler og omkostnings-øjebliksbilleder',
              'Foto- og dokumentpakker',
              'Milepælsopfølgning og afvigelsesoverblik',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <FileStack className="mt-0.5 h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Data & compliance */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-navy">Data og compliance</h3>
        </div>
        <p className="text-sm text-gray-700">
          Vi håndterer data in-house, holder dokumentation organiseret og respekterer jeres
          sikkerhedsstandarder. GDPR, kontrakter og adgang håndteres omhyggeligt, og vi kan
          integrere med jeres workflows efter behov.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          {[
            'GDPR-bevidste processer',
            'Rollebasede adgangsrettigheder til filer',
            'Rene afleveringspakker',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <footer className="mt-10">
        <Link
          href="/contact/office"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Planlæg jeres entrepriseprojekt
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
