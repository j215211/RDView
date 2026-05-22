import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LicenseService } from './license.service';

@ApiTags('license')
@Controller('license')
export class LicenseController {
  constructor(private readonly svc: LicenseService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fingerprint')
  fingerprint() { return this.svc.fingerprint(); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('status')
  status() { return this.svc.status(); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('install')
  install(@Body() body: { content: string }) { return this.svc.install(body.content); }
}
