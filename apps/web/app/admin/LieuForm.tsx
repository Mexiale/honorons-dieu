'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Lieu, Religion } from '@/lib/types';

const CHAMPS_TEXTE: {
  key: string;
  label: string;
  required?: boolean;
}[] = [
  { key: 'nom', label: 'Nom du lieu', required: true },
  { key: 'adresse', label: 'Adresse', required: true },
  { key: 'ville', label: 'Ville', required: true },
  { key: 'commune', label: 'Commune' },
  { key: 'quartier', label: 'Quartier' },
  { key: 'telephone', label: 'Téléphone' },
  { key: 'email', label: 'Email' },
  { key: 'site', label: 'Site web' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'photo', label: 'URL de la photo' },
];

const OPTIONS_BOOL = [
  { key: 'parking', label: 'Parking' },
  { key: 'accessible', label: 'Accès PMR' },
  { key: 'climatisation', label: 'Climatisation' },
  { key: 'toilettes', label: 'Toilettes' },
] as const;

export function LieuForm({
  lieu,
  onClose,
}: {
  lieu?: Lieu | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({
    nom: lieu?.nom ?? '',
    religionId: lieu?.religionId ?? '',
    description: lieu?.description ?? '',
    telephone: lieu?.telephone ?? '',
    email: lieu?.email ?? '',
    site: lieu?.site ?? '',
    adresse: lieu?.adresse ?? '',
    ville: lieu?.ville ?? 'Abidjan',
    commune: lieu?.commune ?? '',
    quartier: lieu?.quartier ?? '',
    latitude: lieu?.latitude ?? '',
    longitude: lieu?.longitude ?? '',
    photo: lieu?.photo ?? '',
    responsable: lieu?.responsable ?? '',
    parking: lieu?.parking ?? false,
    accessible: lieu?.accessible ?? false,
    climatisation: lieu?.climatisation ?? false,
    toilettes: lieu?.toilettes ?? false,
  });
  const [error, setError] = useState('');

  const { data: religions } = useQuery({
    queryKey: ['religions'],
    queryFn: () => api<Religion[]>('/religions'),
  });

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === '' || v == null) continue;
        if (k === 'religionId') body[k] = Number(v);
        else if (k === 'latitude' || k === 'longitude') body[k] = Number(v);
        else body[k] = v;
      }
      return lieu
        ? api(`/lieux/${lieu.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : api('/lieux', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lieux'] });
      onClose();
    },
    onError: (e) => setError((e as Error).message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    save.mutate();
  };

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h3 className="font-display font-semibold text-primary">
        {lieu ? `Modifier « ${lieu.nom} »` : 'Ajouter un lieu de culte'}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHAMPS_TEXTE.map(({ key, label, required }) => (
          <input
            key={key}
            value={String(form[key] ?? '')}
            onChange={(e) => set(key, e.target.value)}
            placeholder={label + (required ? ' *' : '')}
            required={required}
            className="input !py-2.5"
          />
        ))}
        <select
          value={String(form.religionId)}
          onChange={(e) => set('religionId', e.target.value)}
          required
          className="input !py-2.5"
        >
          <option value="">Religion *</option>
          {religions?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nom}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={String(form.latitude)}
            onChange={(e) => set('latitude', e.target.value)}
            placeholder="Latitude *"
            required
            className="input !py-2.5"
          />
          <input
            value={String(form.longitude)}
            onChange={(e) => set('longitude', e.target.value)}
            placeholder="Longitude *"
            required
            className="input !py-2.5"
          />
        </div>
      </div>

      <textarea
        value={String(form.description ?? '')}
        onChange={(e) => set('description', e.target.value)}
        placeholder="Description"
        className="input min-h-20"
      />

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {OPTIONS_BOOL.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(form[key])}
              onChange={(e) => set(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending} className="btn-primary !py-2">
          {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary !py-2">
          Annuler
        </button>
      </div>
    </form>
  );
}
