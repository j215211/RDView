import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CameraService } from './camera.service';
import { CreateCameraDto, UpdateCameraDto } from './camera.dto';

@ApiTags('camera')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cameras')
export class CameraController {
  constructor(private readonly svc: CameraService) {}

  @Get()
  list(@Query('q') q?: string, @Query('online') online?: string, @Query('nvrId') nvrId?: string) {
    return this.svc.list({
      q,
      online: online === undefined ? undefined : online === 'true',
      nvrId: nvrId ? Number(nvrId) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() dto: CreateCameraDto) {
    return this.svc.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCameraDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
