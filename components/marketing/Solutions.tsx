//components/marketing/Solutions.tsx
import { HardHat, Building2, Users, ClipboardCheck, FileSignature, Truck } from 'lucide-react';

const items = [
  { icon: HardHat, title: 'Temporary staffing', desc: 'Qualified trades for short bursts, nights or weekends.' },
  { icon: Building2, title: 'Project-based crews', desc: 'Teams for phases like formwork, bricklaying, fit-out.' },
  { icon: Users, title: 'Subcontractor management', desc: 'Coordinate multiple subs under one contract.' },
  { icon: ClipboardCheck, title: 'Timesheets & approvals', desc: 'Start/finish/breaks with PM sign-off.' },
  { icon: FileSignature, title: 'Payroll & compliance', desc: 'Correct contracts, tax cards and documentation.' },
  { icon: Truck, title: 'Site-ready mobilization', desc: 'Workers arrive briefed with PPE and site rules.' },
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">Solutions we provide</h2>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Built for construction and civil works—whether you need one specialist or a full crew.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-white p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <span className="rounded-xl border w-10 h-10 grid place-items-center bg-gray-50">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-medium">{title}</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
