'use client';

import { LocateFixed, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function AccueilPage() {
  const router = useRouter();
  const [ville, setVille] = useState('');
  const [locating, setLocating] = useState(false);

  const rechercherVille = (e: FormEvent) => {
    e.preventDefault();
    if (ville.trim()) router.push(`/carte?q=${encodeURIComponent(ville.trim())}`);
  };

  const utiliserPosition = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        router.push(
          `/carte?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&rayon=5`,
        ),
      () => {
        setLocating(false);
        alert(
          "Impossible d'obtenir votre position. Autorisez la géolocalisation ou recherchez une ville.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-20 text-center sm:pt-28">
      <span className="mb-6 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-sm font-medium text-primary">
        Côte d&apos;Ivoire · Églises · Mosquées · Temples
      </span>

      <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
        Trouver un lieu de culte
        <br />
        <span className="text-gold">près de moi</span>
      </h1>

      <p className="mt-5 max-w-xl text-gray-500">
        Localisez en quelques secondes une église, une mosquée ou un temple
        autour de vous, consultez les horaires et laissez-vous guider.
      </p>

      <form onSubmit={rechercherVille} className="mt-10 w-full max-w-xl">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-primary/5 focus-within:border-primary">
          <Search className="ml-3 shrink-0 text-gray-400" size={20} />
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Rechercher une ville, une commune, un quartier…"
            className="w-full bg-transparent py-3 outline-none"
          />
          <button type="submit" className="btn-primary !rounded-xl !py-3">
            Rechercher
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <button
          onClick={utiliserPosition}
          disabled={locating}
          className="btn-secondary"
        >
          <LocateFixed size={18} className="text-gold" />
          {locating ? 'Localisation…' : 'Utiliser ma position'}
        </button>
        <span className="text-sm text-gray-400">ou</span>
        <button onClick={() => router.push('/carte')} className="btn-secondary">
          Explorer la carte
        </button>
      </div>

      <div className="mt-16 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['🟦', 'Catholique'],
          ['🟩', 'Protestante'],
          ['🟨', 'Évangélique'],
          ['🟥', 'Mosquée'],
        ].map(([icone, nom]) => (
          <div key={nom} className="card !p-4 text-sm text-gray-600">
            <span className="mr-2">{icone}</span>
            {nom}
          </div>
        ))}
      </div>
    </div>
  );
}
