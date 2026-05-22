import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OnvifService } from './onvif.service';

@ApiTags('onvif')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onvif')
export class OnvifController {
  constructor(private readonly svc: OnvifService) {}

  @Get('discover')
  discover(@Query('timeout') timeout?: string) {
    return this.svc.discover(timeout ? Number(timeout) : 3500);
  }

  @Post('probe')
  probe(@Body() body: { host: string; port?: number; username: string; password: string }) {
    return this.svc.probe(body.host, body.port || 80, body.username, body.password);
  }
}
