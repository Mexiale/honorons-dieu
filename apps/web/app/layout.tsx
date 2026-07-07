import type { Metadata, Viewport } from 'next';
import { Dancing_Script, Inter, Poppins } from 'next/font/google';
import { Header } from '@/components/Header';
import { PwaRegister } from '@/components/PwaRegister';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
});

export const metadata: Metadata = {
  title: 'Honorons Dieu — Trouvez un lieu de culte près de vous',
  description:
    "Localisez églises, mosquées, temples et salles du Royaume en Côte d'Ivoire : horaires, contacts, itinéraires. Ici, là-bas, partout.",
  applicationName: 'HonoronsDieu',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HonoronsDieu',
  },
  icons: {
    apple: '/icons/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#152B47',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning : des extensions navigateur (traduction,
    // correcteurs) injectent des attributs sur <html>/<body> avant l'hydratation
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${dancing.variable} font-sans`}
        suppressHydrationWarning
      >
        <Providers>
          <PwaRegister />
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-gray-100 bg-white py-8">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
              <span className="font-script text-2xl text-primary">
                Honorons Dieu
              </span>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">
                Ici, là-bas, partout.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Trouver un lieu de culte en Côte d&apos;Ivoire — églises,
                mosquées, temples.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
