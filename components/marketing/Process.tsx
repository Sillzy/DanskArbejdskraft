//components/marketing/Process.tsx
import { ClipboardList, SearchCheck, Handshake, Clock3, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: ClipboardList, title: '1) Request', desc: 'Site, trade, headcount, start date.' },
  { icon: SearchCheck,  title: '2) Match',   desc: 'We shortlist vetted workers or crews.' },
  { icon: Handshake,    title: '3) Onboard', desc: 'Contracts & compliance handled.' },
  { icon: Clock3,       title: '4) Track',   desc: 'Start / end / breaks with approvals.' },
  { icon: CheckCircle2, title: '5) Export',  desc: 'Approved hours to payroll & invoices.' },
];

export default function Process() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 text-center hover:shadow-md transition">
              <div className="mx-auto w-12 h-12 grid place-items-center rounded-2xl bg-gray-900 text-white">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
