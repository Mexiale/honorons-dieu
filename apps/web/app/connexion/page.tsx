'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { api, API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { User } from '@/lib/types';

function ConnexionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Retour de Google OAuth : /connexion?token=xxx
  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setSession(token).then(() => router.replace('/'));
    }
  }, [params, setSession, router]);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body =
        mode === 'login' ? { email, password } : { nom, email, password };
      const res = await api<{ token: string; user: User }>(
        `/auth/${mode === 'login' ? 'login' : 'register'}`,
        { method: 'POST', body: JSON.stringify(body) },
      );
      await setSession(res.token, res.user);
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-primary">
        {mode === 'login' ? 'Connexion' : 'Créer un compte'}
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Enregistrez vos paroisses, mosquées et temples favoris.
      </p>

      <div className="card mt-8">
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-50 p-1 text-sm font-medium">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 transition ${
                mode === m ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
              }`}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom complet"
              required
              className="input"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse email"
            required
            className="input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe (8 caractères min.)"
            required
            minLength={mode === 'register' ? 8 : undefined}
            className="input"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading
              ? 'Patientez…'
              : mode === 'login'
                ? 'Se connecter'
                : "S'inscrire"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-300">
          <span className="h-px flex-1 bg-gray-100" />
          ou
          <span className="h-px flex-1 bg-gray-100" />
        </div>

        <a href={`${API_URL}/auth/google`} className="btn-secondary w-full">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </a>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionInner />
    </Suspense>
  );
}
