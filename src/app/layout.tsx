// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Header from '../../components/marketing/Header';
import Footer from '../../components/marketing/Footer';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dansk Arbejdskraft — Bemanding til byggebranchen',
  description:
    'Vores prioriteter er vores folk og jeres projekt. Vores virksomhed er bygget på kvalitet og et netværk af dygtige specialister på tværs af flere byggeområder.',
  openGraph: {
    title: 'Dansk Arbejdskraft — Bemanding til byggebranchen',
    description:
      'Vores prioriteter er vores folk og jeres projekt. Vores virksomhed er bygget på kvalitet og et netværk af dygtige specialister på tværs af flere byggeområder.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gradient-to-b from-white text-gray-900`}>
        {/* Global header (fixed) */}
        <Header />

        {/* Add top padding so content clears the fixed header */}
        <main className="min-h-[70vh] pt-16 md:pt-20">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
