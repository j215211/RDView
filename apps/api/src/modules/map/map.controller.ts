import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MapService } from './map.service';

@ApiTags('map')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('maps')
export class MapController {
  constructor(private readonly svc: MapService) {}

  @Get()
  list() { return this.svc.list(); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.svc.get(id); }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.svc.createFromUpload(file, body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
