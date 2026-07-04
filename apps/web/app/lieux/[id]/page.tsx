'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Flag,
  Globe,
  Heart,
  Mail,
  MapPin,
  Navigation,
  Phone,
  User,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { itineraireUrl } from '@/components/LieuCard';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Favori, Lieu, TYPE_HORAIRE_LABELS } from '@/lib/types';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function FicheLieuPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [signalement, setSignalement] = useState('');
  const [showSignalement, setShowSignalement] = useState(false);

  const { data: lieu, isLoading } = useQuery({
    queryKey: ['lieu', id],
    queryFn: () => api<Lieu>(`/lieux/${id}`),
  });

  const { data: favoris } = useQuery({
    queryKey: ['favoris'],
    queryFn: () => api<Favori[]>('/favoris'),
    enabled: !!user,
  });
  const estFavori = favoris?.some((f) => f.lieuId === Number(id));

  const toggleFavori = useMutation({
    mutationFn: () =>
      api(`/favoris/${id}`, { method: estFavori ? 'DELETE' : 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoris'] }),
  });

  const envoyerSignalement = useMutation({
    mutationFn: () =>
      api('/signalements', {
        method: 'POST',
        body: JSON.stringify({ lieuId: Number(id), message: signalement }),
      }),
    onSuccess: () => {
      setShowSignalement(false);
      setSignalement('');
      alert('Merci ! Votre signalement a été transmis aux administrateurs.');
    },
  });

  if (isLoading)
    return <p className="p-10 text-center text-gray-400">Chargement…</p>;
  if (!lieu)
    return <p className="p-10 text-center text-gray-400">Lieu introuvable.</p>;

  const infos = [
    { icon: MapPin, value: `${lieu.adresse}${lieu.commune ? `, ${lieu.commune}` : ''}, ${lieu.ville}` },
    { icon: Phone, value: lieu.telephone, href: `tel:${lieu.telephone}` },
    { icon: Mail, value: lieu.email, href: `mailto:${lieu.email}` },
    { icon: Globe, value: lieu.site, href: lieu.site ?? undefined },
    { icon: User, value: lieu.responsable },
  ].filter((i) => i.value);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {lieu.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lieu.photo}
          alt={lieu.nom}
          className="mb-6 h-64 w-full rounded-2xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: lieu.religion.couleur }}
          >
            {lieu.religion.nom}
          </span>
          <h1 className="font-display text-3xl font-bold text-primary">
            {lieu.nom}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            GPS : {lieu.latitude.toFixed(5)}, {lieu.longitude.toFixed(5)}
          </p>
        </div>
        <div className="flex gap-2">
          {user && (
            <button
              onClick={() => toggleFavori.mutate()}
              className={`btn-secondary ${estFavori ? '!border-red-200 !text-red-500' : ''}`}
            >
              <Heart size={18} fill={estFavori ? 'currentColor' : 'none'} />
              {estFavori ? 'Favori' : 'Ajouter'}
            </button>
          )}
          <a
            href={itineraireUrl(lieu)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Navigation size={18} />
            S&apos;y rendre
          </a>
        </div>
      </div>

      {lieu.description && (
        <p className="mt-6 leading-relaxed text-gray-600">{lieu.description}</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-display font-semibold text-primary">
            Informations pratiques
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            {infos.map(({ icon: Icon, value, href }, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 shrink-0 text-gold" />
                {href ? (
                  <a href={href} className="hover:underline" target="_blank" rel="noopener noreferrer">
                    {value}
                  </a>
                ) : (
                  <span>{value}</span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
            {lieu.parking && <span className="rounded-full bg-gray-50 px-3 py-1">🅿️ Parking</span>}
            {lieu.accessible && <span className="rounded-full bg-gray-50 px-3 py-1">♿ Accès PMR</span>}
            {lieu.climatisation && <span className="rounded-full bg-gray-50 px-3 py-1">❄️ Climatisation</span>}
            {lieu.toilettes && <span className="rounded-full bg-gray-50 px-3 py-1">🚻 Toilettes</span>}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-display font-semibold text-primary">
            Horaires
          </h2>
          {lieu.horaires?.length ? (
            <ul className="space-y-2 text-sm">
              {lieu.horaires.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between border-b border-gray-50 pb-2"
                >
                  <span className="text-gray-600">
                    {h.jour} · {TYPE_HORAIRE_LABELS[h.type]}
                  </span>
                  <span className="font-medium text-primary">{h.heure}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Horaires non renseignés.</p>
          )}
        </div>
      </div>

      <div className="mt-6 h-64 overflow-hidden rounded-2xl border border-gray-100">
        <MapView lieux={[lieu]} />
      </div>

      <div className="mt-6">
        {user ? (
          showSignalement ? (
            <div className="card">
              <h3 className="mb-2 font-semibold text-primary">
                Signaler une information erronée
              </h3>
              <textarea
                value={signalement}
                onChange={(e) => setSignalement(e.target.value)}
                placeholder='Ex : "Cet horaire est incorrect, la messe de dimanche est à 8h."'
                className="input min-h-24"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => envoyerSignalement.mutate()}
                  disabled={signalement.trim().length < 5 || envoyerSignalement.isPending}
                  className="btn-primary !py-2"
                >
                  Envoyer
                </button>
                <button
                  onClick={() => setShowSignalement(false)}
                  className="btn-secondary !py-2"
                >
                  Annuler
                </button>
              </div>
              {envoyerSignalement.isError && (
                <p className="mt-2 text-sm text-red-500">
                  {(envoyerSignalement.error as Error).message}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSignalement(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500"
            >
              <Flag size={14} />
              Une information est erronée ? Signalez-la.
            </button>
          )
        ) : (
          <button
            onClick={() => router.push('/connexion')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary"
          >
            <Flag size={14} />
            Connectez-vous pour signaler une information erronée.
          </button>
        )}
      </div>
    </div>
  );
}
