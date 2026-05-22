import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCameraDto, UpdateCameraDto } from './camera.dto';

@Injectable()
export class CameraService {
  constructor(private readonly prisma: PrismaService) {}

  list(opts: { q?: string; online?: boolean; nvrId?: number } = {}) {
    return this.prisma.camera.findMany({
      where: {
        ...(opts.q && { OR: [
          { code: { contains: opts.q, mode: 'insensitive' } },
          { name: { contains: opts.q, mode: 'insensitive' } },
        ]}),
        ...(opts.online !== undefined && { online: opts.online }),
        ...(opts.nvrId && { nvrId: opts.nvrId }),
      },
      include: { nvr: { select: { id: true, name: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async get(id: number) {
    const cam = await this.prisma.camera.findUnique({
      where: { id },
      include: { nvr: true, points: { include: { map: true } } },
    });
    if (!cam) throw new NotFoundException('摄像头不存在');
    return cam;
  }

  create(dto: CreateCameraDto) {
    return this.prisma.camera.create({ data: dto });
  }

  update(id: number, dto: UpdateCameraDto) {
    return this.prisma.camera.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.camera.delete({ where: { id } });
  }

  // 心跳/状态更新 — 流媒体网关回调 or 定时探活
  async setOnline(id: number, online: boolean) {
    return this.prisma.camera.update({
      where: { id },
      data: { online, lastSeenAt: online ? new Date() : undefined },
    });
  }
}
