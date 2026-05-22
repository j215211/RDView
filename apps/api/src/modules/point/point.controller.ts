import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PointService } from './point.service';

@ApiTags('point')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('points')
export class PointController {
  constructor(private readonly svc: PointService) {}

  @Get()
  list(@Query('mapId', ParseIntPipe) mapId: number) {
    return this.svc.listByMap(mapId);
  }

  @Post()
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post('batch-move')
  batchMove(@Body() body: { updates: any[] }) {
    return this.svc.batchMove(body.updates);
  }
}
