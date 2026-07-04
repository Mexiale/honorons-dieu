'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function ProfilPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) return <p className="p-10 text-center text-gray-400">Chargement…</p>;
  if (!user)
    return (
      <div className="p-16 text-center">
        <p className="text-gray-500">Vous n&apos;êtes pas connecté(e).</p>
        <Link href="/connexion" className="btn-primary mt-4">
          Connexion
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-gold">
          {user.nom.charAt(0).toUpperCase()}
        </span>
        <h1 className="mt-4 font-display text-xl font-bold text-primary">
          {user.nom}
        </h1>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className="mt-2 inline-block rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
          {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
        </span>
        <div className="mt-6 space-y-2">
          <Link href="/favoris" className="btn-secondary w-full">
            Mes favoris
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className="btn-secondary w-full">
              Tableau de bord admin
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="btn-primary w-full !bg-red-500 hover:!bg-red-600"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
