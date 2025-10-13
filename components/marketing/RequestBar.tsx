//components/marketing/RequestBar.tsx
'use client';
import { useState } from 'react';

export default function RequestBar() {
  const [trade, setTrade] = useState('');
  const [area, setArea] = useState('');
  const [heads, setHeads] = useState<number | ''>('');
  const [start, setStart] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Crew request — ' + (trade || 'General'));
    const details = [
      trade && `Trade: ${trade}`,
      area && `Area: ${area}`,
      heads && `Headcount: ${heads}`,
      start && `Start: ${start}`,
    ].filter(Boolean).join('\n');

    const body = encodeURIComponent(details + '\n\nPlease call me back.');
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-2xl border bg-white p-3 sm:p-4 shadow-sm"
    >
      <div className="grid gap-2 md:grid-cols-5">
        <select
          className="border rounded-lg px-3 py-2 bg-white"
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
        >
          <option value="">Trade</option>
          <option>Carpentry</option>
          <option>Concrete / Formwork</option>
          <option>Masonry</option>
          <option>Demolition</option>
          <option>Earthworks</option>
          <option>General labor</option>
        </select>
        <input
          className="border rounded-lg px-3 py-2 bg-white"
          placeholder="Area / City"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2 bg-white"
          type="number"
          min={1}
          placeholder="Headcount"
          value={heads}
          onChange={(e) => setHeads(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className="border rounded-lg px-3 py-2 bg-white"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <button className="rounded-lg px-4 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600">
          Request crew
        </button>
      </div>
    </form>
  );
}
