import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tak | Dansk Arbejdskraft',
  description: 'Vi har modtaget din besked og vender tilbage hurtigst muligt.',
};

export default function Page() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-20 md:py-28">
      {/* Subtile baggrundsaccenter */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-blue-200/30 blur-[72px]" />
        <div className="absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-indigo-200/30 blur-[72px]" />
      </div>

      {/* Kort */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
          <CheckCircle2 className="h-7 w-7 text-blue-700" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-navy">Tak</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-700">
          Vi har modtaget din besked. Vores team gennemgår den og vender tilbage hurtigst muligt
          med klare næste skridt.
        </p>

        <div className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Home className="mr-2 h-4 w-4" />
            Til forsiden
          </Link>

          <Link
            href="/services/temporary-staff"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Se ydelser
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left text-sm text-blue-900 ring-1 ring-blue-200">
          <div className="mb-1 flex items-center font-semibold">
            <Mail className="mr-2 h-4 w-4" />
            Hvad sker der nu
          </div>
          <ul className="ml-5 list-disc space-y-1">
            <li>Vi bekræfter din forespørgsel og tidsplan.</li>
            <li>Vi kan følge op med et par praktiske spørgsmål.</li>
            <li>Du modtager en klar plan eller et forslag baseret på dit behov.</li>
          </ul>
        </div>
      </section>

      {/* Hurtige links */}
      <section className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
        <QuickLink href="/services/temporary-staff" label="Midlertidig bemanding" description="Få dygtige folk hurtigt" />
        <QuickLink href="/services/project-based-crews" label="Projektbaserede hold" description="Sammensæt hold til en opgave" />
        <QuickLink href="/services/enterprise-project" label="Enterprise-projekt" description="Én partner på tværs af fag" />
      </section>
    </main>
  );
}

/* ---------- Hjælper ---------- */
function QuickLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-sm font-semibold text-navy">{label}</div>
      <div className="text-xs text-gray-600">{description}</div>
      <div className="mt-2 h-[3px] w-0 bg-blue-200 transition-all group-hover:w-full" />
    </Link>
  );
}
