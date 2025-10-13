//components/marketing/Logos.tsx
export default function Logos() {
  const logos = ['BygCo', 'NordForm', 'Civils A/S', 'Brick+Beam', 'MetroBuild', 'FormTek'];
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-6">
          <p className="text-xs uppercase tracking-wider text-gray-500 text-center">
            Trusted by teams across construction & civil works
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
            {logos.map((l) => (
              <div key={l} className="text-center text-sm text-gray-500 font-medium opacity-70">
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
