import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsInt, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { PrismaService } from '../prisma/prisma.service';

class CreateSignalementDto {
  @Type(() => Number)
  @IsInt()
  lieuId: number;

  @IsString()
  @MinLength(5)
  message: string;
}

enum Statut {
  EN_ATTENTE = 'EN_ATTENTE',
  TRAITE = 'TRAITE',
  REJETE = 'REJETE',
}

class UpdateStatutDto {
  @IsEnum(Statut)
  status: Statut;
}

@Controller('signalements')
export class SignalementsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateSignalementDto,
  ) {
    return this.prisma.signalement.create({
      data: { userId: user.id, lieuId: dto.lieuId, message: dto.message },
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  list() {
    return this.prisma.signalement.findMany({
      include: {
        lieu: { select: { id: true, nom: true } },
        user: { select: { id: true, nom: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatutDto,
  ) {
    return this.prisma.signalement.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}

@Module({ controllers: [SignalementsController] })
export class SignalementsModule {}
