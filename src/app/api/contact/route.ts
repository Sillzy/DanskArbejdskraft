// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isBot(form: FormData) {
  return (form.get('company_website') as string) ? true : false; // honeypot
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    if (isBot(form)) {
      // pretend success to bots
      return NextResponse.redirect(new URL('/contact/office/thanks', req.url), 303);
    }

    const name = String(form.get('name') || '').trim();
    const company = String(form.get('company') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const message = String(form.get('message') || '').trim();

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST!;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER!; // e.g. hello@danskarbejdskraft.dk
    const pass = process.env.SMTP_PASS!;
    const from = process.env.MAIL_FROM || user; // FROM must match authenticated user on most hosts

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 8px">New contact request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Dansk Arbejdskraft" <${from}>`, // keep same domain/mailbox as SMTP_USER
      to: 'hello@danskarbejdskraft.dk',
      subject: `Contact form — ${name}${company ? ` (${company})` : ''}`,
      replyTo: email,
      html,
    });

    // ✅ Success: show Thank You page
    return NextResponse.redirect(new URL('/contact/office/thanks', req.url), 303);
  } catch (err) {
    console.error('Contact form error:', err);
    // show a minimal error; you can render a custom error page if you prefer
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
