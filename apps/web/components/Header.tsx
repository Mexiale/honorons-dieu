'use client';

import { Heart, LogOut, MapPin, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-[1000] border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-gold">
            <MapPin size={20} />
          </span>
          <span className="font-display text-lg font-semibold text-primary">
            HonoronsDieu
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium text-gray-600 sm:gap-2">
          <Link href="/carte" className="rounded-lg px-3 py-2 hover:bg-gray-50">
            Carte
          </Link>
          {user && (
            <Link
              href="/favoris"
              className="flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <Heart size={16} />
              <span className="hidden sm:inline">Favoris</span>
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-gold hover:bg-gray-50"
            >
              <Shield size={16} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/profil"
                className="flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-50"
              >
                <User size={16} />
                <span className="hidden sm:inline">{user.nom}</span>
              </Link>
              <button
                onClick={logout}
                title="Se déconnecter"
                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link href="/connexion" className="btn-primary !px-4 !py-2 text-sm">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
