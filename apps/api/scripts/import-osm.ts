/**
 * Import des lieux de culte depuis OpenStreetMap (Overpass API).
 *
 * Usage :
 *   npm run import:osm            -> Abidjan (défaut)
 *   npm run import:osm -- bouake  -> autre ville
 *   npm run import:osm -- all     -> toutes les villes préconfigurées
 *
 * Idempotent : chaque lieu est identifié par son osm_id, relancer le script
 * n'ajoute que les nouveautés. Les lieux dont le nom existe déjà en base
 * (ex. données du seed) sont ignorés pour éviter les doublons visuels.
 */
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bounding boxes [sud, ouest, nord, est]
const VILLES: Record<string, { nom: string; bbox: [number, number, number, number] }> = {
  abidjan: { nom: 'Abidjan', bbox: [5.2, -4.2, 5.5, -3.85] },
  yamoussoukro: { nom: 'Yamoussoukro', bbox: [6.75, -5.35, 6.92, -5.2] },
  bouake: { nom: 'Bouaké', bbox: [7.62, -5.12, 7.75, -4.97] },
  'san-pedro': { nom: 'San-Pédro', bbox: [4.68, -6.72, 4.82, -6.55] },
  korhogo: { nom: 'Korhogo', bbox: [9.38, -5.68, 9.5, -5.55] },
  daloa: { nom: 'Daloa', bbox: [6.84, -6.5, 6.94, -6.4] },
};

// Confessions HonoronsDieu <- tags OSM religion/denomination
const RELIGIONS = {
  Catholique: { icone: 'church', couleur: '#2563EB' },
  Protestante: { icone: 'church', couleur: '#16A34A' },
  Évangélique: { icone: 'church', couleur: '#EAB308' },
  Musulmane: { icone: 'mosque', couleur: '#DC2626' },
  'Témoins de Jéhovah': { icone: 'hall', couleur: '#7C3AED' },
  Harriste: { icone: 'church', couleur: '#0D9488' },
  Chrétienne: { icone: 'church', couleur: '#6B7280' }, // dénomination non précisée
} as const;

type NomReligion = keyof typeof RELIGIONS;

const DENOMINATIONS: Record<string, NomReligion> = {
  catholic: 'Catholique',
  roman_catholic: 'Catholique',
  protestant: 'Protestante',
  methodist: 'Protestante',
  baptist: 'Protestante',
  presbyterian: 'Protestante',
  anglican: 'Protestante',
  lutheran: 'Protestante',
  reformed: 'Protestante',
  adventist: 'Protestante',
  seventh_day_adventist: 'Protestante',
  evangelical: 'Évangélique',
  pentecostal: 'Évangélique',
  assemblies_of_god: 'Évangélique',
  foursquare: 'Évangélique',
  charismatic: 'Évangélique',
  celestial_church_of_christ: 'Évangélique',
  jehovahs_witness: 'Témoins de Jéhovah',
  harrist: 'Harriste',
};

interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function religionDe(tags: Record<string, string>): NomReligion | null {
  const religion = tags.religion?.toLowerCase();
  const deno = tags.denomination?.toLowerCase().replace(/[\s-]/g, '_');
  if (religion === 'muslim') return 'Musulmane';
  if (religion === 'christian') {
    return (deno && DENOMINATIONS[deno]) || 'Chrétienne';
  }
  return null; // autres religions : trop rares en CI pour le MVP
}

// Miroirs publics d'Overpass, essayés dans l'ordre en cas de surcharge (504)
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

async function fetchOverpass(bbox: [number, number, number, number]) {
  const query = `
    [out:json][timeout:90];
    nwr["amenity"="place_of_worship"](${bbox.join(',')});
    out center tags;
  `;
  let derniereErreur: Error = new Error('Aucun miroir Overpass disponible');
  for (const url of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // L'API publique Overpass demande d'identifier les clients
          'User-Agent': 'HonoronsDieu/0.1 (import lieux de culte CI; contact: mexialegrace@gmail.com)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status} (${url})`);
      const json = (await res.json()) as { elements: OsmElement[] };
      return json.elements;
    } catch (e) {
      derniereErreur = e as Error;
      console.warn(`   ⚠️ ${derniereErreur.message} — essai du miroir suivant…`);
    }
  }
  throw derniereErreur;
}

async function importVille(cle: string, religionIds: Record<string, number>) {
  const ville = VILLES[cle];
  console.log(`\n📍 ${ville.nom} — interrogation d'Overpass…`);
  const elements = await fetchOverpass(ville.bbox);

  const nomsExistants = new Set(
    (await prisma.lieu.findMany({ select: { nom: true } })).map((l) =>
      l.nom.toLowerCase(),
    ),
  );

  let sansNom = 0;
  let autresReligions = 0;
  let dejaConnus = 0;

  const lieux: Prisma.LieuCreateManyInput[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const nom = tags.name?.trim();
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!nom || lat == null || lng == null) {
      sansNom++;
      continue;
    }
    const religion = religionDe(tags);
    if (!religion) {
      autresReligions++;
      continue;
    }
    if (nomsExistants.has(nom.toLowerCase())) {
      dejaConnus++;
      continue;
    }
    nomsExistants.add(nom.toLowerCase());

    const commune =
      tags['addr:suburb'] ??
      (tags['addr:city'] && tags['addr:city'] !== ville.nom
        ? tags['addr:city']
        : undefined);
    const quartier = tags['addr:quarter'] ?? tags['addr:neighbourhood'];
    const rue = [tags['addr:housenumber'], tags['addr:street']]
      .filter(Boolean)
      .join(' ');

    lieux.push({
      osmId: `${el.type}/${el.id}`,
      nom,
      religionId: religionIds[religion],
      adresse: rue || quartier || commune || ville.nom,
      ville: ville.nom,
      commune,
      quartier,
      latitude: lat,
      longitude: lng,
      telephone: tags.phone ?? tags['contact:phone'],
      email: tags.email ?? tags['contact:email'],
      site: tags.website ?? tags['contact:website'],
      description: tags.opening_hours
        ? `Horaires indicatifs (OpenStreetMap) : ${tags.opening_hours}`
        : undefined,
      accessible: tags.wheelchair === 'yes',
    });
  }

  const { count } = await prisma.lieu.createMany({
    data: lieux,
    skipDuplicates: true, // osm_id unique -> relance sans doublon
  });

  console.log(
    `   ${elements.length} objets OSM -> ${count} lieux importés ` +
      `(ignorés : ${sansNom} sans nom, ${autresReligions} hors confessions cibles, ${dejaConnus} déjà en base)`,
  );
  return count;
}

async function main() {
  const arg = (process.argv[2] ?? 'abidjan').toLowerCase();
  const cles = arg === 'all' ? Object.keys(VILLES) : [arg];
  if (!cles.every((c) => VILLES[c])) {
    console.error(`Ville inconnue. Choix : ${Object.keys(VILLES).join(', ')}, all`);
    process.exit(1);
  }

  const religionIds: Record<string, number> = {};
  for (const [nom, attrs] of Object.entries(RELIGIONS)) {
    const r = await prisma.religion.upsert({
      where: { nom },
      update: {},
      create: { nom, ...attrs },
    });
    religionIds[nom] = r.id;
  }

  let total = 0;
  for (const cle of cles) {
    total += await importVille(cle, religionIds);
    // Politesse envers l'API Overpass (publique et gratuite)
    if (cles.length > 1) await new Promise((r) => setTimeout(r, 5000));
  }
  console.log(`\n✅ Import terminé : ${total} nouveaux lieux.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
