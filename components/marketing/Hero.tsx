//components/marketing/Hero.tsx
import Link from 'next/link';
import RequestBar from './RequestBar';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-orange-100 blur-3xl opacity-60" />
        <div className="absolute right-[-120px] -top-24 h-[420px] w-[420px] rounded-full bg-gray-100 blur-3xl opacity-70" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-gray-200 bg-white/80 backdrop-blur">
              Construction staffing
            </span>
            <h1 className="mt-6 text-4xl sm:text-6xl font-semibold leading-tight tracking-tight">
              Find <span className="text-orange-600 italic">fleksibilitet</span> på byggepladsen.
            </h1>
            <p className="mt-5 text-lg text-gray-700 max-w-xl">
              Carpenters, concrete workers, masonry, general labor and more —
              for days, weeks or long-term projects. Fast onboarding, compliant
              payroll, and approvals that keep sites moving.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/onboarding/company"
                className="inline-flex items-center px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-black"
              >
                Hire talent
              </Link>
              <Link
                href="/onboarding/employee"
                className="inline-flex items-center px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
              >
                Join as worker
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
              >
                Talk to sales
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Industries: carpentry (tømrer), concrete/formwork (beton), masonry (murværk),
              demolition, earthworks, and more.
            </p>
          </div>

          {/* right-side visual */}
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-3xl border bg-gradient-to-br from-gray-50 to-white shadow-sm overflow-hidden">
              {/* no external images required; decorative grid */}
              <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="absolute bottom-6 right-6 rounded-2xl border bg-white/90 backdrop-blur p-4 shadow">
                <div className="text-sm font-medium">Average start time</div>
                <div className="text-2xl font-semibold">48 min</div>
                <div className="text-xs text-gray-500">from request to confirmed worker</div>
              </div>
            </div>
          </div>
        </div>

        {/* pill search/request like moment.dk */}
        <RequestBar />
      </div>
    </section>
  );
}
