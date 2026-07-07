'use client';

import { Heart, LogOut, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-[1000] border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gold-light via-gold to-[#B8912B] font-serif text-base font-bold italic text-[#141414]">
            HD
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-script text-xl font-bold text-primary">
              Honorons Dieu
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gold">
              Ici, là-bas, partout.
            </span>
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
