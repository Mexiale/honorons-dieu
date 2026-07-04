import { Controller, Get, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('religions')
export class ReligionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.religion.findMany({ orderBy: { nom: 'asc' } });
  }
}

@Module({ controllers: [ReligionsController] })
export class ReligionsModule {}
