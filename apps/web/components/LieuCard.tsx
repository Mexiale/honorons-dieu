import { MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';
import { Lieu } from '@/lib/types';

export function itineraireUrl(lieu: Lieu) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lieu.latitude},${lieu.longitude}`;
}

export function LieuCard({ lieu }: { lieu: Lieu }) {
  return (
    <div className="card flex items-start gap-4 transition hover:shadow-md">
      <span
        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: lieu.religion?.couleur ?? '#1E3A5F' }}
      >
        <MapPin size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/lieux/${lieu.id}`}
          className="font-display font-semibold text-primary hover:underline"
        >
          {lieu.nom}
        </Link>
        <p className="truncate text-sm text-gray-500">
          {lieu.religion?.nom} · {lieu.adresse}
          {lieu.commune ? `, ${lieu.commune}` : ''}
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
          {lieu.distanceKm != null && (
            <span className="font-medium text-gold">à {lieu.distanceKm} km</span>
          )}
          {lieu.parking && <span>🅿️ Parking</span>}
          {lieu.accessible && <span>♿ Accès PMR</span>}
          {lieu.climatisation && <span>❄️ Climatisé</span>}
          {lieu.toilettes && <span>🚻 Toilettes</span>}
        </div>
      </div>
      <a
        href={itineraireUrl(lieu)}
        target="_blank"
        rel="noopener noreferrer"
        title="Itinéraire Google Maps"
        className="rounded-xl border border-gray-100 p-2 text-primary hover:bg-gray-50"
      >
        <Navigation size={18} />
      </a>
    </div>
  );
}
