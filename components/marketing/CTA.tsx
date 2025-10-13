//components/marketing/CTA.tsx
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-r from-gray-900 to-black text-white p-8 sm:p-12">
          <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to staff your next project?</h3>
              <p className="mt-2 text-sm/6 text-gray-200">
                Tell us what you need and we’ll assemble the right crew—fast.
              </p>
            </div>
            <div className="flex gap-3 sm:justify-end">
              <Link href="/onboarding/company" className="inline-flex items-center px-5 py-3 rounded-xl bg-white text-gray-900 hover:bg-gray-200">
                Hire talent
              </Link>
              <Link href="/onboarding/employee" className="inline-flex items-center px-5 py-3 rounded-xl border border-white/30 hover:bg-white/10">
                Join as worker
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
