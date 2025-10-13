// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Header from '../../components/marketing/Header';
import Footer from '../../components/marketing/Footer';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DanskArbejdskraft — Construction Staffing',
  description:
    'Project-based and flexible staffing for construction: carpenters, concrete workers, masonry, civil works and more. Fast onboarding, compliant payroll, and approved timesheets.',
  openGraph: {
    title: 'DanskArbejdskraft',
    description:
      'Project-based and flexible staffing for construction: carpenters, concrete workers, masonry, civil works and more.',
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
