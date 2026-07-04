'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Lieu, Signalement, User } from '@/lib/types';
import { LieuForm } from './LieuForm';

type Onglet = 'lieux' | 'signalements' | 'utilisateurs';

interface Stats {
  lieux: number;
  utilisateurs: number;
  signalementsEnAttente: number;
  favoris: number;
}

type AdminUser = User & {
  createdAt: string;
  _count: { favoris: number; signalements: number };
};

const STATUT_LABELS = {
  EN_ATTENTE: ['En attente', 'bg-amber-50 text-amber-600'],
  TRAITE: ['Traité', 'bg-green-50 text-green-600'],
  REJETE: ['Rejeté', 'bg-gray-100 text-gray-500'],
} as const;

export default function AdminPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [onglet, setOnglet] = useState<Onglet>('lieux');
  const [editLieu, setEditLieu] = useState<Lieu | null | 'new'>(null);

  const isAdmin = user?.role === 'ADMIN';

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<Stats>('/admin/stats'),
    enabled: isAdmin,
  });
  const { data: lieux } = useQuery({
    queryKey: ['lieux', 'admin'],
    queryFn: () => api<Lieu[]>('/lieux'),
    enabled: isAdmin,
  });
  const { data: signalements } = useQuery({
    queryKey: ['signalements'],
    queryFn: () => api<Signalement[]>('/signalements'),
    enabled: isAdmin,
  });
  const { data: utilisateurs } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<AdminUser[]>('/admin/utilisateurs'),
    enabled: isAdmin,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['lieux'] });
    queryClient.invalidateQueries({ queryKey: ['signalements'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const supprimerLieu = useMutation({
    mutationFn: (id: number) => api(`/lieux/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  const majSignalement = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api(`/signalements/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: invalidate,
  });
  const supprimerUser = useMutation({
    mutationFn: (id: number) =>
      api(`/admin/utilisateurs/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  if (loading) return <p className="p-10 text-center text-gray-400">Chargement…</p>;
  if (!isAdmin)
    return (
      <div className="p-16 text-center">
        <p className="text-gray-500">Accès réservé aux administrateurs.</p>
        <Link href="/connexion" className="btn-primary mt-4">
          Connexion
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-primary">
        Tableau de bord
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Lieux de culte', stats?.lieux],
          ['Utilisateurs', stats?.utilisateurs],
          ['Signalements en attente', stats?.signalementsEnAttente],
          ['Favoris enregistrés', stats?.favoris],
        ].map(([label, valeur]) => (
          <div key={String(label)} className="card !p-4">
            <p className="font-display text-2xl font-bold text-primary">
              {valeur ?? '—'}
            </p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-b border-gray-100 text-sm font-medium">
        {(
          [
            ['lieux', 'Lieux'],
            ['signalements', 'Signalements'],
            ['utilisateurs', 'Utilisateurs'],
          ] as [Onglet, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setOnglet(key)}
            className={`border-b-2 px-4 py-2 ${
              onglet === key
                ? 'border-gold text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {onglet === 'lieux' && (
        <div className="mt-6 space-y-4">
          {editLieu ? (
            <LieuForm
              lieu={editLieu === 'new' ? null : editLieu}
              onClose={() => setEditLieu(null)}
            />
          ) : (
            <button onClick={() => setEditLieu('new')} className="btn-primary !py-2">
              <Plus size={16} /> Ajouter un lieu
            </button>
          )}
          <div className="space-y-2">
            {lieux?.map((lieu) => (
              <div
                key={lieu.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: lieu.religion?.couleur }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-700">{lieu.nom}</p>
                  <p className="truncate text-xs text-gray-400">
                    {lieu.religion?.nom} · {lieu.ville}
                    {lieu.commune ? ` · ${lieu.commune}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setEditLieu(lieu)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-primary"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() =>
                    confirm(`Supprimer « ${lieu.nom} » ?`) &&
                    supprimerLieu.mutate(lieu.id)
                  }
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {onglet === 'signalements' && (
        <div className="mt-6 space-y-3">
          {!signalements?.length && (
            <p className="text-gray-400">Aucun signalement.</p>
          )}
          {signalements?.map((s) => {
            const [label, classes] = STATUT_LABELS[s.status];
            return (
              <div key={s.id} className="card !p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-700">
                      <Link
                        href={`/lieux/${s.lieu.id}`}
                        className="text-primary hover:underline"
                      >
                        {s.lieu.nom}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-400">
                      Par {s.user.nom} ({s.user.email}) ·{' '}
                      {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}>
                    {label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">« {s.message} »</p>
                {s.status === 'EN_ATTENTE' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => majSignalement.mutate({ id: s.id, status: 'TRAITE' })}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100"
                    >
                      Marquer traité
                    </button>
                    <button
                      onClick={() => majSignalement.mutate({ id: s.id, status: 'REJETE' })}
                      className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {onglet === 'utilisateurs' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Rôle</th>
                <th className="py-2 pr-4">Favoris</th>
                <th className="py-2 pr-4">Inscrit le</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {utilisateurs?.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-700">{u.nom}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-gold/10 text-gold'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{u._count.favoris}</td>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-right">
                    {u.id !== user?.id && (
                      <button
                        onClick={() =>
                          confirm(`Supprimer le compte de ${u.nom} ?`) &&
                          supprimerUser.mutate(u.id)
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
