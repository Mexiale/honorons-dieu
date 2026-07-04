# HonoronsDieu 🕊️

**Trouver rapidement un lieu de culte autour de soi** — églises, mosquées, temples et salles du Royaume en Côte d'Ivoire. Horaires, contacts, accessibilité et itinéraire en un clic.

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind CSS · React Query |
| Cartographie | Leaflet + OpenStreetMap (gratuit, sans clé API — basculable vers Mapbox/Google) |
| Backend | NestJS 10 · Prisma 6 |
| Base de données | PostgreSQL + PostGIS (Supabase / Neon / local) |
| Auth | JWT + Google OAuth (optionnel) |

## Structure

```
honorons-dieu/
├── apps/
│   ├── api/   # API NestJS (port 3001)
│   └── web/   # Frontend Next.js (port 3000)
└── package.json  # npm workspaces
```

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la base de données

Créez `apps/api/.env` à partir de `apps/api/.env.example` et renseignez `DATABASE_URL` (Supabase : *Project Settings → Database → Connection string*).

```bash
npm run db:push    # crée les tables
npm run db:seed    # religions, lieux d'Abidjan, compte admin
```

> Le seed active l'extension **PostGIS** (recherche par distance) et crée le compte admin `admin@honoronsdieu.ci` / `Admin@2026` (changez-le via `ADMIN_PASSWORD`).

### 3. Lancer

```bash
npm run dev:api   # http://localhost:3001
npm run dev:web   # http://localhost:3000
```

## Fonctionnalités MVP

- 🏠 **Accueil** : « Trouver un lieu de culte près de moi » — géolocalisation ou recherche de ville
- 🗺️ **Carte interactive** : marqueurs colorés par confession (🟦 catholique, 🟩 protestante, 🟨 évangélique, 🟥 mosquée…)
- 🔍 **Recherche** : nom, ville, commune, quartier
- 🎚️ **Filtres** : confession, distance (< 2/5/10 km via PostGIS), parking, accès PMR, climatisation, toilettes
- 📄 **Fiche lieu** : photo, contacts, GPS, horaires, responsable + bouton **S'y rendre** (Google Maps)
- ❤️ **Favoris** (utilisateur connecté)
- 🔐 **Comptes** : email/mot de passe (JWT) + Google OAuth
- 🚩 **Signalements** : « Cet horaire est incorrect » → file de modération
- 🛠️ **Admin** : stats, CRUD lieux, traitement des signalements, gestion des utilisateurs

## API — principaux endpoints

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/lieux?q=&religionId=&lat=&lng=&rayon=&parking=true…` | Recherche + filtres + distance |
| GET | `/lieux/:id` | Fiche complète (horaires inclus) |
| POST/PATCH/DELETE | `/lieux` | CRUD (admin) |
| GET | `/religions` | Confessions et couleurs |
| POST | `/auth/register` · `/auth/login` · GET `/auth/google` | Authentification |
| GET/POST/DELETE | `/favoris/:lieuId` | Favoris (connecté) |
| POST | `/signalements` · PATCH `/signalements/:id` | Signalement / modération |
| GET | `/admin/stats` · `/admin/utilisateurs` | Tableau de bord |

## Google OAuth (optionnel)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → créer un identifiant OAuth 2.0.
2. URI de redirection : `http://localhost:3001/auth/google/callback`.
3. Renseigner `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` dans `apps/api/.env`.

## Déploiement

- **Web** : Vercel (root directory `apps/web`, variable `NEXT_PUBLIC_API_URL`)
- **API** : Railway ou Render (root `apps/api`, build `npm run build`, start `npm run start`)
- **Base** : Supabase ou Neon (PostGIS activé par le seed)

## V2 (feuille de route)

Horaires des messes/prières enrichis, notifications, événements religieux, diffusion live, dons (CinetPay), demandes de prières, calendrier liturgique, agenda paroissial, app mobile Flutter/React Native.
