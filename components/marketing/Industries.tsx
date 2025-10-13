//components/marketing/Industries.tsx
const industries = [
  'Carpentry (Tømrer)','Concrete & Formwork (Beton)','Masonry (Murværk)',
  'Demolition','Earthworks','General labor','Steel fixing','Scaffolding',
  'Painting & finishing','Operators','Site cleanup','Renovation crews'
];

export default function Industries() {
  return (
    <section id="industries" className="py-14 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">Industries we cover</h2>
        <p className="mt-2 text-gray-600 max-w-2xl">We match certified workers to your site and schedule.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {industries.map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-sm">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
