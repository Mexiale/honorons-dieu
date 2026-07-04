import {
  Body,
  Controller,
  Delete,
  Get,
  Module,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { CreateLieuDto, SearchLieuxDto } from './dto';
import { LieuxService } from './lieux.service';

@Controller('lieux')
export class LieuxController {
  constructor(private lieux: LieuxService) {}

  @Get()
  search(@Query() query: SearchLieuxDto) {
    return this.lieux.search(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lieux.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateLieuDto) {
    return this.lieux.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateLieuDto>,
  ) {
    return this.lieux.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lieux.remove(id);
  }
}

@Module({
  controllers: [LieuxController],
  providers: [LieuxService],
  exports: [LieuxService],
})
export class LieuxModule {}
