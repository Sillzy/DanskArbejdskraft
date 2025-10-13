//components/marketing/Contact.tsx
'use client';
import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [msg, setMsg] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Staffing enquiry from ' + name);
    const body = encodeURIComponent(msg + '\n\nFrom: ' + name + ' (' + email + ')');
    window.location.href = 'mailto:hello@example.com?subject=' + subject + '&body=' + body;
  };

  return (
    <section id="contact" className="py-16 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Contact us</h2>
          <p className="mt-2 text-gray-600">Tell us about your site and staffing needs. We’ll respond the same business day.</p>
          <ul className="mt-6 text-sm text-gray-700 space-y-1">
            <li>Email: <a className="underline" href="mailto:hello@example.com">hello@example.com</a></li>
            <li>Phone: <a className="underline" href="tel:+4512345678">+45 12 34 56 78</a></li>
            <li>Address: Copenhagen, Denmark</li>
          </ul>
        </div>
        <form onSubmit={submit} className="rounded-2xl border p-5 bg-gray-50">
          <div className="grid gap-3">
            <input className="border p-3 rounded-lg bg-white" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
            <input className="border p-3 rounded-lg bg-white" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            <textarea className="border p-3 rounded-lg min-h-[120px] bg-white" placeholder="Project, trade, start date…" value={msg} onChange={e=>setMsg(e.target.value)} />
            <button className="px-5 py-3 rounded-lg bg-gray-900 text-white hover:bg-black">Send email</button>
          </div>
        </form>
      </div>
    </section>
  );
}
