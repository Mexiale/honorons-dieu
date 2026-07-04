'use client';

import { useQuery } from '@tanstack/react-query';
import { List, LocateFixed, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { Filters, FiltersState } from '@/components/Filters';
import { LieuCard } from '@/components/LieuCard';
import { api } from '@/lib/api';
import { Lieu } from '@/lib/types';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-gray-400">
      Chargement de la carte…
    </div>
  ),
});

function CartePageInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [position, setPosition] = useState<[number, number] | null>(() => {
    const lat = params.get('lat');
    const lng = params.get('lng');
    return lat && lng ? [Number(lat), Number(lng)] : null;
  });
  const [filters, setFilters] = useState<FiltersState>({
    rayon: params.get('rayon') ? Number(params.get('rayon')) : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [mobileView, setMobileView] = useState<'carte' | 'liste'>('carte');

  const { data: lieux = [], isLoading, error } = useQuery({
    queryKey: ['lieux', search, filters, position],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (search) sp.set('q', search);
      if (filters.religionId) sp.set('religionId', String(filters.religionId));
      if (position) {
        sp.set('lat', String(position[0]));
        sp.set('lng', String(position[1]));
        if (filters.rayon) sp.set('rayon', String(filters.rayon));
      }
      for (const key of ['parking', 'accessible', 'climatisation', 'toilettes'] as const) {
        if (filters[key]) sp.set(key, 'true');
      }
      return api<Lieu[]>(`/lieux?${sp.toString()}`);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSearch(q.trim());
  };

  const geolocaliser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Impossible d'obtenir votre position."),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, ville, commune, quartier…"
              className="input !py-2.5 pl-10"
            />
          </div>
          <button type="submit" className="btn-primary !py-2.5">
            Rechercher
          </button>
        </form>
        <div className="flex gap-2">
          <button
            onClick={geolocaliser}
            className={`btn-secondary !py-2.5 ${position ? '!border-gold !text-gold' : ''}`}
          >
            <LocateFixed size={18} />
            <span className="hidden sm:inline">
              {position ? 'Position active' : 'Ma position'}
            </span>
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-secondary !py-2.5"
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card mt-4">
          <Filters
            value={filters}
            onChange={setFilters}
            geoActive={!!position}
          />
        </div>
      )}

      <div className="mt-4 flex gap-2 lg:hidden">
        <button
          onClick={() => setMobileView('carte')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium ${mobileView === 'carte' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          <MapIcon size={16} /> Carte
        </button>
        <button
          onClick={() => setMobileView('liste')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium ${mobileView === 'liste' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          <List size={16} /> Liste ({lieux.length})
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <div
          className={`h-[65vh] overflow-hidden rounded-2xl border border-gray-100 ${mobileView === 'liste' ? 'hidden lg:block' : ''}`}
        >
          <MapView lieux={lieux} position={position} />
        </div>

        <div
          className={`max-h-[65vh] space-y-3 overflow-y-auto ${mobileView === 'carte' ? 'hidden lg:block' : ''}`}
        >
          {isLoading && <p className="text-gray-400">Recherche en cours…</p>}
          {error && (
            <p className="text-red-500">
              Impossible de contacter l&apos;API. Vérifiez qu&apos;elle est
              démarrée.
            </p>
          )}
          {!isLoading && !error && !lieux.length && (
            <p className="text-gray-400">
              Aucun lieu trouvé. Élargissez votre recherche.
            </p>
          )}
          {lieux.map((lieu) => (
            <LieuCard key={lieu.id} lieu={lieu} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CartePage() {
  return (
    <Suspense>
      <CartePageInner />
    </Suspense>
  );
}
