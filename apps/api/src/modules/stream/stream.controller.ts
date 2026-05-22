import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StreamService } from './stream.service';

@ApiTags('stream')
@Controller()
export class StreamController {
  constructor(private readonly svc: StreamService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('streams/:cameraId/start')
  start(@Param('cameraId', ParseIntPipe) id: number, @Query('sub') sub?: string) {
    return this.svc.start(id, sub === '1' || sub === 'true');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('streams/:cameraId/stop')
  stop(@Param('cameraId', ParseIntPipe) id: number, @Query('sub') sub?: string) {
    return this.svc.stop(id, sub === '1' || sub === 'true');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('streams/:cameraId/snapshot')
  snapshot(@Param('cameraId', ParseIntPipe) id: number) {
    return this.svc.snapshot(id);
  }

  // ZLMediaKit webhooks (internal, no auth)
  @Post('internal/zlm/on_publish')
  onPublish(@Body() body: any) { return this.svc.onHook('on_publish', body); }

  @Post('internal/zlm/on_play')
  onPlay(@Body() body: any) { return this.svc.onHook('on_play', body); }

  @Post('internal/zlm/on_stream_changed')
  onStreamChanged(@Body() body: any) { return this.svc.onHook('on_stream_changed', body); }

  @Post('internal/zlm/on_stream_not_found')
  onNotFound(@Body() body: any) { return this.svc.onHook('on_stream_not_found', body); }
}
