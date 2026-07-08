import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light via-gold to-[#B8912B] font-serif text-2xl font-bold italic text-[#141414]">
        HD
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold text-primary">
        Page introuvable
      </h1>
      <p className="mt-2 max-w-md text-gray-500">
        Cette page n&apos;existe pas ou a été déplacée. Mais un lieu de culte
        près de vous, lui, existe sûrement.
      </p>
      <Link href="/carte" className="btn-primary mt-8">
        <MapPin size={18} />
        Explorer la carte
      </Link>
    </div>
  );
}
