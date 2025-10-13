// components/marketing/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/90 backdrop-blur supports-[backdrop-filter]:bg-slate-100/75">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Brand + tagline */}
        <div>
          <Link href="/" aria-label="Dansk Arbejdskraft — Hjem" className="inline-flex items-center">
            <Image
              src="/Logo.png"
              alt="Dansk Arbejdskraft"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Byg hurtigere med fleksibel bemanding til byggeri og anlægsarbejde. Dygtige specialister, klar til at levere.
          </p>
        </div>

        {/* Solutions */}
        <div>
          <div className="mb-3 font-medium text-slate-900">Løsninger</div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <Link href="/services/temporary-staff" className="hover:underline">
                Midlertidigt personale
              </Link>
            </li>
            <li>
              <Link href="/services/project-based-crews" className="hover:underline">
                Projektbaserede hold
              </Link>
            </li>
            <li>
              <Link href="/services/subcontractor" className="hover:underline">
                Underentreprise
              </Link>
            </li>
            <li>
              <Link href="/services/smart-time-registration" className="hover:underline">
                Smart tidsregistrering
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <div className="mb-3 font-medium text-slate-900">Virksomhed</div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <Link href="/contact/office" className="hover:underline">
                Find arbejdskraft
              </Link>
            </li>
            <li>
              <Link href="/signup?next=/dashboard/onboarding" className="hover:underline">
                Bliv medarbejder
              </Link>
            </li>
            <li>
              <Link href="/signup?next=/dashboard/" className="hover:underline">
                Log ind
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="mb-3 font-medium text-slate-900">Kontakt</div>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>Virksomhed: Dansk Arbejdskraft ApS</li>
            <li>
              E-mail:{' '}
              <a className="underline" href="mailto:hello@danskarbejdskraft.dk">
                hello@danskarbejdskraft.dk
              </a>
            </li>
            <li>CVR: 45923134</li>
            <li>Adresse: Enghavevej 12, 4100 Ringsted</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Dansk Arbejdskraft ApS. Alle rettigheder forbeholdes.
      </div>
    </footer>
  );
}
