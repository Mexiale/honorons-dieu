'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Religion } from '@/lib/types';

export interface FiltersState {
  religionId?: number;
  rayon?: number;
  parking?: boolean;
  accessible?: boolean;
  climatisation?: boolean;
  toilettes?: boolean;
}

const RAYONS = [2, 5, 10];
const ACCESSIBILITE: { key: keyof FiltersState; label: string }[] = [
  { key: 'parking', label: '🅿️ Parking' },
  { key: 'accessible', label: '♿ Accès PMR' },
  { key: 'climatisation', label: '❄️ Climatisation' },
  { key: 'toilettes', label: '🚻 Toilettes' },
];

export function Filters({
  value,
  onChange,
  geoActive,
}: {
  value: FiltersState;
  onChange: (f: FiltersState) => void;
  geoActive: boolean;
}) {
  const { data: religions } = useQuery({
    queryKey: ['religions'],
    queryFn: () => api<Religion[]>('/religions'),
  });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">Confession</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ ...value, religionId: undefined })}
            className={`rounded-full border px-3 py-1 text-sm ${
              !value.religionId
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 text-gray-600 hover:border-primary'
            }`}
          >
            Toutes
          </button>
          {religions?.map((r) => (
            <button
              key={r.id}
              onClick={() =>
                onChange({
                  ...value,
                  religionId: value.religionId === r.id ? undefined : r.id,
                })
              }
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                value.religionId === r.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: r.couleur }}
              />
              {r.nom}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">Distance</h3>
        {!geoActive && (
          <p className="mb-2 text-xs text-gray-400">
            Activez votre position pour filtrer par distance.
          </p>
        )}
        <div className="flex gap-2">
          {RAYONS.map((r) => (
            <button
              key={r}
              disabled={!geoActive}
              onClick={() =>
                onChange({ ...value, rayon: value.rayon === r ? undefined : r })
              }
              className={`rounded-full border px-3 py-1 text-sm disabled:opacity-40 ${
                value.rayon === r
                  ? 'border-gold bg-gold text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gold'
              }`}
            >
              &lt; {r} km
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">
          Accessibilité
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACCESSIBILITE.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChange({ ...value, [key]: !value[key] })}
              className={`rounded-full border px-3 py-1 text-sm ${
                value[key]
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
