//components/marketing/Stats.tsx
import { CheckCircle2, Timer, Shield } from 'lucide-react';

const stats = [
  { icon: Timer, label: 'Average onboarding', value: '6 min' },
  { icon: CheckCircle2, label: 'Timesheets approved within', value: '24 h' },
  { icon: Shield, label: 'Compliance accuracy', value: '100%' },
];

export default function Stats() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border bg-white p-6 text-center">
              <div className="mx-auto w-12 h-12 grid place-items-center rounded-2xl bg-gray-900 text-white">
                <Icon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-3xl font-semibold">{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
