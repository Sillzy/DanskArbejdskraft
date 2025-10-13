import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  ClipboardCheck,
  BarChart3,
  FileStack,
  Shield,
  Server,
  Lock,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart tidsregistrering | Dansk Arbejdskraft',
  description:
    'Enkel, præcis tidsregistrering bygget in-house — klare timesedler, nem eksport og rapportering for alle projektstørrelser.',
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
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy">Smart tidsregistrering</h1>

        <p className="mt-3 max-w-3xl text-gray-700">
          Vi byggede tidsregistrering in-house, fordi alle bør have det — ikke kun enterprise-projekter.
          De fleste SaaS-værktøjer er dyre og passer ikke til virkeligheden på pladsen. Vores løsning
          er enkel for vores medarbejdere at bruge hos jer og er forbundet med resten af vores workflow,
          så timer flyder rent ind i rapporter og fakturaer uden ekstra administration.
        </p>

        {/* Highlights */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Pill icon={<Wallet className="h-4 w-4" />} text="Ingen pr.-bruger-overraskelser" />
          <Pill icon={<Server className="h-4 w-4" />} text="Data og kontrol in-house" />
          <Pill icon={<Clock className="h-4 w-4" />} text="Bygget til forholdene på pladsen" />
        </div>
      </header>

      {/* To-kolonne layout */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Hvad det løser */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Hvad det løser</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Klare timesedler, nemme at udfylde på pladsen',
              'Enkel mærkning af timer pr. projekt og plads',
              'Mindre manuel indtastning og færre fejl',
              'Hurtig eksport til løn og fakturering',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Virker til både små opgaver og lange projekter. Den samme simple proces for alle giver
            bedre brug og renere data.
          </div>
        </article>

        {/* Nøglefunktioner */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Nøglefunktioner</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              'Daglig og ugentlig registrering med simple noter',
              'Vedhæft fotos eller dokumenter til en vagt efter behov',
              'Klassificering efter projekt, plads og fag',
              'Rapporter og PDF-eksport til jeres arkiv',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
            Ingen formandsgodkendelse er påkrævet. Timesedlerne er klare og sporbare med
            valgfrie noter og vedhæftninger, når kontekst er vigtig.
          </div>
        </article>
      </section>

      {/* Hvorfor in-house */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-navy">Hvorfor in-house tidsregistrering</h3>
        </div>
        <p className="text-sm text-gray-700">
          In-house betyder kontrol, hastighed og omkostningseffektivitet. Vi undgår tunge licenser,
          holder data tæt på arbejdet og tilpasser værktøjet til, hvordan teams faktisk opererer.
          Når system og mennesker er under samme tag, løses problemer hurtigere, og forbedringer
          udrulles hurtigt.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {[
            'Lavere løbende omkostning end typiske SaaS-løsninger',
            'Ingen afhængighed af tredjeparts oppetid for kerneopgaver',
            'Færre logins og én sandhedskilde',
            'Direkte feedback-loop fra pladsen til produktet',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rapportering og aflevering */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Indsigt og rapportering</h2>
          </div>
          <p className="text-sm text-gray-700">
            Timer samles pr. projekt, plads og fag, så I kan se indsats- og omkostningstendenser
            med et blik. Eksportér øjebliksbilleder til interessenter uden ekstra formatering.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {[
              'Daglige og ugentlige overblik',
              'Øjebliksbilleder af omkostninger og timer',
              'Simpelt trend-overblik til planlægning',
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
            <FileStack className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-navy">Dokumentationspakke</h2>
          </div>
          <p className="text-sm text-gray-700">
            Har I brug for en ren afleveringspakke for en fase eller plads? Vi kan samle timesedler,
            noter og fotos i en delbar fil.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {['PDF- eller rapporteksport', 'Pr. projekt eller pr. plads', 'Valgfrie bilag', 'Klar til deling'].map(
              (item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ),
            )}
          </ul>
        </article>
      </section>

      {/* Data & compliance */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-navy">Data og compliance</h3>
        </div>
        <p className="text-sm text-gray-700">
          Vi håndterer data in-house og respekterer jeres sikkerhedsstandarder. GDPR, kontrakter og
          adgang håndteres omhyggeligt, og vi kan matche jeres behov for opbevaring.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          {['GDPR-bevidste processer', 'Rollebasede filrettigheder', 'Ren eksport på anmodning'].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
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
          Send en forespørgsel
        </Link>
      </footer>
    </main>
  );
}

/* ---------- Hjælpere (server-safe) ---------- */

function Pill({
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
