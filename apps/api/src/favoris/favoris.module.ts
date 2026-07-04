import {
  Controller,
  Delete,
  Get,
  Module,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '../auth/guards';
import { PrismaService } from '../prisma/prisma.service';

@Controller('favoris')
@UseGuards(JwtAuthGuard)
export class FavorisController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: { id: number }) {
    return this.prisma.favori.findMany({
      where: { userId: user.id },
      include: { lieu: { include: { religion: true } } },
      orderBy: { id: 'desc' },
    });
  }

  @Post(':lieuId')
  add(
    @CurrentUser() user: { id: number },
    @Param('lieuId', ParseIntPipe) lieuId: number,
  ) {
    return this.prisma.favori.upsert({
      where: { userId_lieuId: { userId: user.id, lieuId } },
      update: {},
      create: { userId: user.id, lieuId },
    });
  }

  @Delete(':lieuId')
  async remove(
    @CurrentUser() user: { id: number },
    @Param('lieuId', ParseIntPipe) lieuId: number,
  ) {
    await this.prisma.favori.deleteMany({
      where: { userId: user.id, lieuId },
    });
    return { deleted: true };
  }
}

@Module({ controllers: [FavorisController] })
export class FavorisModule {}
