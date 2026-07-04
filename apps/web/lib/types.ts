export interface Religion {
  id: number;
  nom: string;
  icone: string;
  couleur: string;
}

export interface Horaire {
  id: number;
  lieuId: number;
  jour: string;
  heure: string;
  type: 'MESSE' | 'CULTE' | 'PRIERE' | 'VEILLEE';
}

export interface Lieu {
  id: number;
  nom: string;
  religionId: number;
  religion: Religion;
  description?: string | null;
  telephone?: string | null;
  email?: string | null;
  site?: string | null;
  adresse: string;
  ville: string;
  commune?: string | null;
  quartier?: string | null;
  latitude: number;
  longitude: number;
  photo?: string | null;
  photos: string[];
  responsable?: string | null;
  parking: boolean;
  accessible: boolean;
  climatisation: boolean;
  toilettes: boolean;
  horaires?: Horaire[];
  distanceKm?: number | null;
}

export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Favori {
  id: number;
  userId: number;
  lieuId: number;
  lieu: Lieu;
}

export interface Signalement {
  id: number;
  message: string;
  status: 'EN_ATTENTE' | 'TRAITE' | 'REJETE';
  createdAt: string;
  lieu: { id: number; nom: string };
  user: { id: number; nom: string; email: string };
}

export const TYPE_HORAIRE_LABELS: Record<Horaire['type'], string> = {
  MESSE: 'Messe',
  CULTE: 'Culte',
  PRIERE: 'Prière',
  VEILLEE: 'Veillée',
};
