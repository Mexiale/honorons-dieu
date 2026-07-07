'use client';

import {
  Bell,
  Clock,
  Filter,
  Heart,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { InstallButton } from '@/components/InstallButton';

const CONFESSIONS = [
  { nom: 'Catholique', couleur: '#2563EB' },
  { nom: 'Protestante', couleur: '#16A34A' },
  { nom: 'Évangélique', couleur: '#EAB308' },
  { nom: 'Musulmane', couleur: '#DC2626' },
  { nom: 'Témoins de Jéhovah', couleur: '#7C3AED' },
  { nom: 'Harriste', couleur: '#0D9488' },
  { nom: 'Chrétienne', couleur: '#6B7280' },
];

const ETAPES = [
  {
    icon: LocateFixed,
    titre: 'Localisez-vous',
    texte:
      'Partagez votre position ou recherchez une ville, une commune, un quartier.',
  },
  {
    icon: Map,
    titre: 'Explorez la carte',
    texte:
      'Chaque lieu apparaît avec la couleur de sa confession. Filtrez par distance et commodités.',
  },
  {
    icon: Navigation,
    titre: 'Laissez-vous guider',
    texte:
      "Consultez horaires et contacts, puis lancez l'itinéraire Google Maps en un clic.",
  },
];

const FONCTIONNALITES = [
  {
    icon: Map,
    titre: 'Carte interactive',
    texte: 'Plus de 1 600 lieux de culte géolocalisés dans 6 villes de Côte d\'Ivoire.',
  },
  {
    icon: Filter,
    titre: 'Filtres intelligents',
    texte: 'Confession, distance (2, 5, 10 km), parking, accès PMR, climatisation…',
  },
  {
    icon: Clock,
    titre: 'Horaires des célébrations',
    texte: 'Messes, cultes, prières et veillées — mis à jour par les communautés.',
  },
  {
    icon: Heart,
    titre: 'Vos favoris',
    texte: 'Enregistrez vos paroisses, mosquées et temples pour les retrouver partout.',
  },
  {
    icon: Bell,
    titre: 'Signalement citoyen',
    texte: 'Un horaire incorrect ? Signalez-le, les gestionnaires corrigent.',
  },
  {
    icon: Smartphone,
    titre: 'Application installable',
    texte: 'Ajoutez HonoronsDieu à votre écran d\'accueil, comme une vraie app.',
  },
];

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
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1E33] via-primary-dark to-primary text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #C9A227 0, transparent 40%), radial-gradient(circle at 80% 70%, #C9A227 0, transparent 45%)',
          }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
          <span className="mb-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light via-gold to-[#B8912B] px-6 py-3 font-serif text-2xl font-bold italic text-[#141414] shadow-lg shadow-black/30">
            HD
          </span>

          <h1 className="font-script text-5xl font-bold text-gold-light sm:text-7xl">
            Honorons Dieu
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.45em] text-gold">
            Ici, là-bas, partout.
          </p>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-blue-100/90">
            Trouvez en quelques secondes une église, une mosquée ou un temple
            près de vous — horaires, contacts et itinéraire inclus. Partout en
            Côte d&apos;Ivoire.
          </p>

          <form onSubmit={rechercherVille} className="mt-10 w-full max-w-xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/30">
              <Search className="ml-3 shrink-0 text-gray-400" size={20} />
              <input
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ville, commune, quartier…"
                className="w-full bg-transparent py-3 text-gray-800 outline-none"
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
              className="inline-flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/10 px-6 py-3 font-medium text-gold-light transition hover:bg-gold/20 disabled:opacity-50"
            >
              <LocateFixed size={18} />
              {locating ? 'Localisation…' : 'Utiliser ma position'}
            </button>
            <InstallButton className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20" />
          </div>

          {/* Chiffres clés */}
          <div className="mt-14 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 py-5 backdrop-blur">
            {[
              ['1 600+', 'lieux référencés'],
              ['7', 'confessions'],
              ['6', 'villes couvertes'],
            ].map(([chiffre, label]) => (
              <div key={label} className="px-2 text-center">
                <p className="font-display text-2xl font-bold text-gold sm:text-3xl">
                  {chiffre}
                </p>
                <p className="mt-1 text-xs text-blue-100/70 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-display text-3xl font-bold text-primary">
          Comment ça marche ?
        </h2>
        <p className="mt-2 text-center text-gray-500">
          Trois étapes pour rejoindre votre lieu de culte.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {ETAPES.map(({ icon: Icon, titre, texte }, i) => (
            <div key={titre} className="card relative !p-6 text-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <Icon size={26} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-primary">
                {titre}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Confessions ──────────────────────────────────────── */}
      <section className="bg-gray-50/70 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-primary">
            Toutes les confessions, une seule carte
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-500">
            Chaque lieu porte la couleur de sa communauté pour se repérer en un
            coup d&apos;œil.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CONFESSIONS.map(({ nom, couleur }) => (
              <span
                key={nom}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                <MapPin size={15} style={{ color: couleur }} />
                {nom}
              </span>
            ))}
          </div>
          <Link href="/carte" className="btn-primary mt-10">
            <Map size={18} />
            Ouvrir la carte interactive
          </Link>
        </div>
      </section>

      {/* ── Fonctionnalités ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-display text-3xl font-bold text-primary">
          Pensée pour les fidèles, les visiteurs, les voyageurs
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FONCTIONNALITES.map(({ icon: Icon, titre, texte }) => (
            <div key={titre} className="card flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-display font-semibold text-primary">
                  {titre}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {texte}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-primary to-[#0B1E33] py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <ShieldCheck className="mx-auto text-gold" size={36} />
          <h2 className="mt-4 font-display text-3xl font-bold">
            Prêt(e) à trouver votre lieu de culte ?
          </h2>
          <p className="mt-3 text-blue-100/80">
            Créez un compte gratuit pour enregistrer vos favoris et contribuer à
            des informations fiables pour toute la communauté.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3 font-semibold text-[#141414] transition hover:bg-gold-light"
            >
              Créer mon compte
            </Link>
            <Link
              href="/carte"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-8 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Explorer sans compte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
