import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Module,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const [lieux, utilisateurs, signalements, favoris] = await Promise.all([
      this.prisma.lieu.count(),
      this.prisma.utilisateur.count(),
      this.prisma.signalement.count({ where: { status: 'EN_ATTENTE' } }),
      this.prisma.favori.count(),
    ]);
    return { lieux, utilisateurs, signalementsEnAttente: signalements, favoris };
  }

  @Get('utilisateurs')
  users() {
    return this.prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { favoris: true, signalements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Delete('utilisateurs/:id')
  async deleteUser(
    @CurrentUser() admin: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (id === admin.id) {
      throw new BadRequestException(
        'Impossible de supprimer votre propre compte administrateur',
      );
    }
    await this.prisma.utilisateur.delete({ where: { id } });
    return { deleted: true };
  }
}

@Module({ controllers: [AdminController] })
export class AdminModule {}
