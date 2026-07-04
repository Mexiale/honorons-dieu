import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Header } from '@/components/Header';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'HonoronsDieu — Trouvez un lieu de culte près de vous',
  description:
    "Localisez églises, mosquées, temples et salles du Royaume en Côte d'Ivoire : horaires, contacts, itinéraires.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
            HonoronsDieu · Trouver un lieu de culte en Côte d&apos;Ivoire
          </footer>
        </Providers>
      </body>
    </html>
  );
}
