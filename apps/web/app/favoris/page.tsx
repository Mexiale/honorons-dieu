'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LieuCard } from '@/components/LieuCard';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Favori } from '@/lib/types';

export default function FavorisPage() {
  const { user, loading } = useAuth();

  const { data: favoris, isLoading } = useQuery({
    queryKey: ['favoris'],
    queryFn: () => api<Favori[]>('/favoris'),
    enabled: !!user,
  });

  if (loading) return <p className="p-10 text-center text-gray-400">Chargement…</p>;
  if (!user)
    return (
      <div className="p-16 text-center">
        <p className="text-gray-500">
          Connectez-vous pour retrouver vos lieux favoris.
        </p>
        <Link href="/connexion" className="btn-primary mt-4">
          Connexion
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-primary">
        Mes lieux favoris
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Vos paroisses, mosquées et temples enregistrés.
      </p>
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-gray-400">Chargement…</p>}
        {favoris && !favoris.length && (
          <p className="text-gray-400">
            Aucun favori pour l&apos;instant.{' '}
            <Link href="/carte" className="text-primary underline">
              Explorer la carte
            </Link>
          </p>
        )}
        {favoris?.map((f) => <LieuCard key={f.id} lieu={f.lieu} />)}
      </div>
    </div>
  );
}
