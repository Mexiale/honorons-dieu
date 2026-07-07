import { PrismaClient, TypeHoraire } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // PostGIS pour la recherche par distance (disponible sur Supabase, Neon, etc.)
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS postgis');

  // Upserts séquentiels : Neon (serverless) met plusieurs secondes à se
  // réveiller et fait échouer un Promise.all à froid (P2024)
  const religions: { id: number; nom: string }[] = [];
  for (const r of [
    { nom: 'Catholique', icone: 'church', couleur: '#2563EB' },
    { nom: 'Protestante', icone: 'church', couleur: '#16A34A' },
    { nom: 'Évangélique', icone: 'church', couleur: '#EAB308' },
    { nom: 'Musulmane', icone: 'mosque', couleur: '#DC2626' },
    { nom: 'Témoins de Jéhovah', icone: 'hall', couleur: '#7C3AED' },
    { nom: 'Harriste', icone: 'church', couleur: '#0D9488' },
  ]) {
    religions.push(
      await prisma.religion.upsert({ where: { nom: r.nom }, update: r, create: r }),
    );
  }
  const rel = Object.fromEntries(religions.map((r) => [r.nom, r.id]));

  // Coordonnées approximatives — données d'exemple à vérifier avant production
  const lieux = [
    {
      nom: "Cathédrale Saint-Paul d'Abidjan",
      religionId: rel['Catholique'],
      description:
        "Cathédrale emblématique du Plateau, chef-d'œuvre architectural consacré en 1985.",
      telephone: '+225 27 20 21 22 23',
      adresse: 'Boulevard Angoulvant, Plateau',
      ville: 'Abidjan',
      commune: 'Plateau',
      quartier: 'Plateau',
      latitude: 5.3323,
      longitude: -4.0201,
      responsable: 'Père Curé de la Cathédrale',
      parking: true,
      accessible: true,
      toilettes: true,
      horaires: [
        { jour: 'Dimanche', heure: '07:00', type: TypeHoraire.MESSE },
        { jour: 'Dimanche', heure: '09:30', type: TypeHoraire.MESSE },
        { jour: 'Dimanche', heure: '18:30', type: TypeHoraire.MESSE },
        { jour: 'Lundi-Vendredi', heure: '06:30', type: TypeHoraire.MESSE },
      ],
    },
    {
      nom: 'Paroisse Sainte Famille de la Riviera',
      religionId: rel['Catholique'],
      description: 'Grande paroisse catholique de la Riviera, Cocody.',
      adresse: 'Riviera 2, Cocody',
      ville: 'Abidjan',
      commune: 'Cocody',
      quartier: 'Riviera',
      latitude: 5.3567,
      longitude: -3.9754,
      parking: true,
      climatisation: true,
      horaires: [
        { jour: 'Dimanche', heure: '06:30', type: TypeHoraire.MESSE },
        { jour: 'Dimanche', heure: '09:00', type: TypeHoraire.MESSE },
        { jour: 'Dimanche', heure: '11:00', type: TypeHoraire.MESSE },
      ],
    },
    {
      nom: 'Paroisse Saint Jean de Cocody',
      religionId: rel['Catholique'],
      description: 'Paroisse historique du quartier Cocody Danga.',
      adresse: 'Boulevard de France, Cocody',
      ville: 'Abidjan',
      commune: 'Cocody',
      quartier: 'Danga',
      latitude: 5.3444,
      longitude: -3.9986,
      parking: true,
      accessible: true,
      horaires: [
        { jour: 'Dimanche', heure: '07:30', type: TypeHoraire.MESSE },
        { jour: 'Dimanche', heure: '10:00', type: TypeHoraire.MESSE },
        { jour: 'Samedi', heure: '18:30', type: TypeHoraire.MESSE },
      ],
    },
    {
      nom: 'Basilique Notre-Dame de la Paix',
      religionId: rel['Catholique'],
      description:
        'Plus grande basilique du monde, joyau de Yamoussoukro consacré en 1990.',
      adresse: 'Yamoussoukro',
      ville: 'Yamoussoukro',
      latitude: 6.8107,
      longitude: -5.2894,
      parking: true,
      accessible: true,
      climatisation: true,
      toilettes: true,
      horaires: [
        { jour: 'Dimanche', heure: '10:00', type: TypeHoraire.MESSE },
      ],
    },
    {
      nom: 'Grande Mosquée du Plateau',
      religionId: rel['Musulmane'],
      description: "Grande mosquée du quartier des affaires d'Abidjan.",
      adresse: 'Avenue Lamblin, Plateau',
      ville: 'Abidjan',
      commune: 'Plateau',
      latitude: 5.3269,
      longitude: -4.0244,
      parking: true,
      toilettes: true,
      horaires: [
        { jour: 'Vendredi', heure: '13:00', type: TypeHoraire.PRIERE },
        { jour: 'Tous les jours', heure: '05:30', type: TypeHoraire.PRIERE },
      ],
    },
    {
      nom: 'Mosquée de la Riviera Golf',
      religionId: rel['Musulmane'],
      description:
        'Mosquée moderne de la Riviera Golf, architecture remarquable.',
      adresse: 'Riviera Golf, Cocody',
      ville: 'Abidjan',
      commune: 'Cocody',
      quartier: 'Riviera Golf',
      latitude: 5.3131,
      longitude: -3.9683,
      parking: true,
      accessible: true,
      climatisation: true,
      toilettes: true,
      horaires: [
        { jour: 'Vendredi', heure: '13:00', type: TypeHoraire.PRIERE },
      ],
    },
    {
      nom: 'Grande Mosquée de Treichville',
      religionId: rel['Musulmane'],
      description: 'Mosquée historique du quartier de Treichville.',
      adresse: 'Avenue 16, Treichville',
      ville: 'Abidjan',
      commune: 'Treichville',
      latitude: 5.3016,
      longitude: -4.0086,
      toilettes: true,
      horaires: [
        { jour: 'Vendredi', heure: '13:00', type: TypeHoraire.PRIERE },
      ],
    },
    {
      nom: 'Temple Méthodiste Jubilé du Plateau',
      religionId: rel['Protestante'],
      description: "Temple de l'Église Méthodiste Unie de Côte d'Ivoire.",
      adresse: 'Plateau',
      ville: 'Abidjan',
      commune: 'Plateau',
      latitude: 5.3251,
      longitude: -4.0173,
      parking: true,
      horaires: [
        { jour: 'Dimanche', heure: '08:00', type: TypeHoraire.CULTE },
        { jour: 'Dimanche', heure: '10:30', type: TypeHoraire.CULTE },
      ],
    },
    {
      nom: 'Temple CMA de Yopougon',
      religionId: rel['Protestante'],
      description: "Église de l'Alliance Chrétienne et Missionnaire.",
      adresse: 'Yopougon Selmer',
      ville: 'Abidjan',
      commune: 'Yopougon',
      quartier: 'Selmer',
      latitude: 5.3364,
      longitude: -4.0856,
      horaires: [
        { jour: 'Dimanche', heure: '09:00', type: TypeHoraire.CULTE },
        { jour: 'Mercredi', heure: '18:30', type: TypeHoraire.PRIERE },
      ],
    },
    {
      nom: 'Église Foursquare de Marcory',
      religionId: rel['Évangélique'],
      description: 'Assemblée évangélique dynamique du quartier Marcory.',
      adresse: 'Boulevard du Gabon, Marcory',
      ville: 'Abidjan',
      commune: 'Marcory',
      latitude: 5.3036,
      longitude: -3.9903,
      climatisation: true,
      horaires: [
        { jour: 'Dimanche', heure: '08:30', type: TypeHoraire.CULTE },
        { jour: 'Vendredi', heure: '19:00', type: TypeHoraire.VEILLEE },
      ],
    },
    {
      nom: 'Assemblées de Dieu d’Adjamé',
      religionId: rel['Évangélique'],
      description: 'Grande assemblée évangélique du quartier Adjamé.',
      adresse: 'Adjamé Liberté',
      ville: 'Abidjan',
      commune: 'Adjamé',
      quartier: 'Liberté',
      latitude: 5.3536,
      longitude: -4.0227,
      horaires: [
        { jour: 'Dimanche', heure: '09:00', type: TypeHoraire.CULTE },
      ],
    },
    {
      nom: 'Salle du Royaume de Cocody Angré',
      religionId: rel['Témoins de Jéhovah'],
      description: 'Salle du Royaume des Témoins de Jéhovah, Angré.',
      adresse: 'Angré 8e tranche, Cocody',
      ville: 'Abidjan',
      commune: 'Cocody',
      quartier: 'Angré',
      latitude: 5.3921,
      longitude: -3.9887,
      parking: true,
      horaires: [
        { jour: 'Dimanche', heure: '09:00', type: TypeHoraire.CULTE },
      ],
    },
    {
      nom: 'Église Harriste de Bingerville',
      religionId: rel['Harriste'],
      description:
        'Lieu de culte harriste, religion fondée par le prophète William Wadé Harris.',
      adresse: 'Bingerville',
      ville: 'Bingerville',
      latitude: 5.3553,
      longitude: -3.8851,
      horaires: [
        { jour: 'Dimanche', heure: '08:00', type: TypeHoraire.CULTE },
      ],
    },
  ];

  for (const { horaires, ...lieu } of lieux) {
    const existing = await prisma.lieu.findFirst({ where: { nom: lieu.nom } });
    if (existing) continue;
    await prisma.lieu.create({
      data: { ...lieu, horaires: { create: horaires } },
    });
  }

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? 'Admin@2026',
    10,
  );
  await prisma.utilisateur.upsert({
    where: { email: 'admin@honoronsdieu.ci' },
    update: {},
    create: {
      nom: 'Administrateur',
      email: 'admin@honoronsdieu.ci',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed terminé : religions, lieux, horaires et compte admin.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
