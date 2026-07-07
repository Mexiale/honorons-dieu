import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLieuDto, SearchLieuxDto } from './dto';

@Injectable()
export class LieuxService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchLieuxDto) {
    const where: Prisma.LieuWhereInput = {};
    if (dto.q) {
      where.OR = [
        { nom: { contains: dto.q, mode: 'insensitive' } },
        { ville: { contains: dto.q, mode: 'insensitive' } },
        { commune: { contains: dto.q, mode: 'insensitive' } },
        { quartier: { contains: dto.q, mode: 'insensitive' } },
      ];
    }
    if (dto.religionId) where.religionId = dto.religionId;
    if (dto.ville) where.ville = { equals: dto.ville, mode: 'insensitive' };
    if (dto.commune)
      where.commune = { equals: dto.commune, mode: 'insensitive' };
    if (dto.parking) where.parking = true;
    if (dto.accessible) where.accessible = true;
    if (dto.climatisation) where.climatisation = true;
    if (dto.toilettes) where.toilettes = true;

    // Recherche géographique : le tri/filtre par distance se fait en SQL
    // (PostGIS), sinon on tronquerait les résultats par ordre alphabétique
    if (dto.lat != null && dto.lng != null) {
      const candidats = await this.prisma.lieu.findMany({
        where,
        select: { id: true },
        take: 5000,
      });
      const proches = await this.plusProches(
        candidats.map((c) => c.id),
        dto.lat,
        dto.lng,
        dto.rayon,
      );
      const lieux = await this.prisma.lieu.findMany({
        where: { id: { in: [...proches.keys()] } },
        include: { religion: true },
      });
      return lieux
        .map((l) => ({ ...l, distanceKm: proches.get(l.id) ?? null }))
        .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
    }

    return this.prisma.lieu.findMany({
      where,
      include: { religion: true },
      orderBy: { nom: 'asc' },
      take: 200,
    });
  }

  /** Les 200 lieux les plus proches parmi `ids`, avec leur distance en km. */
  private async plusProches(
    ids: number[],
    lat: number,
    lng: number,
    rayonKm?: number,
  ) {
    if (!ids.length) return new Map<number, number>();
    const rows = await this.prisma.$queryRaw<
      { id: number; distance_km: number }[]
    >`
      SELECT id,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude),
               ST_MakePoint(${lng}, ${lat})
             ) / 1000.0 AS distance_km
      FROM lieux
      WHERE id = ANY(${ids})
        AND (${rayonKm ?? null}::float IS NULL
             OR ST_DistanceSphere(
                  ST_MakePoint(longitude, latitude),
                  ST_MakePoint(${lng}, ${lat})
                ) / 1000.0 <= ${rayonKm ?? null}::float)
      ORDER BY distance_km ASC
      LIMIT 200
    `;
    return new Map(
      rows.map((r) => [r.id, Math.round(Number(r.distance_km) * 100) / 100]),
    );
  }

  async findOne(id: number) {
    const lieu = await this.prisma.lieu.findUnique({
      where: { id },
      include: {
        religion: true,
        horaires: { orderBy: [{ jour: 'asc' }, { heure: 'asc' }] },
      },
    });
    if (!lieu) throw new NotFoundException('Lieu introuvable');
    return lieu;
  }

  create(dto: CreateLieuDto) {
    const { horaires, ...data } = dto;
    return this.prisma.lieu.create({
      data: { ...data, horaires: horaires ? { create: horaires } : undefined },
      include: { religion: true, horaires: true },
    });
  }

  async update(id: number, dto: Partial<CreateLieuDto>) {
    await this.findOne(id);
    const { horaires, ...data } = dto;
    return this.prisma.lieu.update({
      where: { id },
      data: {
        ...data,
        ...(horaires
          ? { horaires: { deleteMany: {}, create: horaires } }
          : {}),
      },
      include: { religion: true, horaires: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.lieu.delete({ where: { id } });
    return { deleted: true };
  }
}
