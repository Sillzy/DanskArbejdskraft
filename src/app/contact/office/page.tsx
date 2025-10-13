import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, MessageSquare, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kontakt kontoret | Dansk Arbejdskraft',
  description: 'Skriv til vores kontor i København. Vi svarer hurtigt.',
};

export default function Page() {
  return (
    <main className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* Subtile baggrundsaccenter */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-[72px]" />
        <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-indigo-200/30 blur-[72px]" />
      </div>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-navy">Kontakt — Kontoret</h1>
        <p className="mt-3 max-w-3xl text-gray-700">
          Fortæl os om dit behov og din tidsplan. Vi vender tilbage med klare næste skridt og en plan for at hjælpe.
        </p>

        {/* Svarløfte */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Pill icon={<Clock className="h-4 w-4" />} text="Svar samme dag på hverdage" />
          <Pill icon={<MessageSquare className="h-4 w-4" />} text="Klare svar og næste skridt" />
          <Pill icon={<ShieldCheck className="h-4 w-4" />} text="Vi respekterer dit privatliv" />
        </div>
      </header>

      {/* Informationsstribe */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
            <Info className="h-4 w-4 text-blue-700" />
          </span>
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Åbningstider</div>
            <div>Mandag til fredag • 08.00–16.00 CET. Vi vender tilbage så hurtigt som muligt.</div>
          </div>
        </div>
      </section>

      {/* Formular som hero */}
      <section>
        {/* Peg formularen på e-mail API-route */}
        <form
          action="/api/contact"
          method="POST"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
        >
          {/* Honeypot (spamfælde) — skal forblive tom */}
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-navy">Send en besked</h2>
            <p className="mt-1 text-sm text-gray-600">
              Giv en kort beskrivelse af din forespørgsel og eventuelle tidsfrister. Vi vender tilbage med næste skridt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="name" className="sr-only">
                Navn
              </label>
              <input
                id="name"
                name="name"
                placeholder="Navn"
                autoComplete="name"
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="company" className="sr-only">
                Virksomhed
              </label>
              <input
                id="company"
                name="company"
                placeholder="Virksomhed"
                autoComplete="organization"
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="sr-only">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="sr-only">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="Telefon (valgfrit)"
                autoComplete="tel"
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="sr-only">
                Hvordan kan vi hjælpe
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Hvordan kan vi hjælpe"
                rows={6}
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Send besked <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <p className="mt-3 text-xs text-slate-500">
            Ved at kontakte os accepterer du, at vi må gemme din besked for at kunne svare. Vi deler ikke dine oplysninger med tredjepart.
          </p>
        </form>
      </section>

      {/* Hurtige links */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink
          href="/services/temporary-staff"
          label="Midlertidig bemanding"
          description="Få forhåndsgodkendte medarbejdere hurtigt"
        />
        <QuickLink
          href="/services/project-based-crews"
          label="Projektbaserede hold"
          description="Sammensæt hold til en afgrænset opgave"
        />
        <QuickLink
          href="/services/enterprise-project"
          label="Enterprise-projekt"
          description="Én partner på tværs af fag og pladser"
        />
      </section>
    </main>
  );
}

/* ---------- Hjælpere (server-safe) ---------- */

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-blue-100">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
        {icon}
      </span>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

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
      className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-sm font-semibold text-navy">{label}</div>
      <div className="text-xs text-gray-600">{description}</div>
      <div className="mt-2 h-[3px] w-0 bg-blue-200 transition-all group-hover:w-full" />
    </Link>
  );
}
