import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

interface UpsertPointDto {
  mapId: number;
  cameraId?: number | null;
  x: number;       // 0~1
  y: number;       // 0~1
  z?: number;      // 0~1 (仅 3D)
  rotation?: number;
  fov?: number;
  label?: string;
  iconColor?: string;
}

@Injectable()
export class PointService {
  constructor(private readonly prisma: PrismaService) {}

  listByMap(mapId: number) {
    return this.prisma.point.findMany({
      where: { mapId },
      include: { camera: { select: { id: true, code: true, name: true, online: true } } },
      orderBy: { id: 'asc' },
    });
  }

  create(dto: UpsertPointDto) {
    return this.prisma.point.create({ data: { ...dto, cameraId: dto.cameraId || undefined } });
  }

  async update(id: number, dto: Partial<UpsertPointDto>) {
    const exist = await this.prisma.point.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('点位不存在');
    return this.prisma.point.update({ where: { id }, data: dto as any });
  }

  remove(id: number) {
    return this.prisma.point.delete({ where: { id } });
  }

  // 批量移动 (拖拽多选时用)
  async batchMove(updates: { id: number; x: number; y: number; z?: number }[]) {
    return this.prisma.$transaction(
      updates.map(u =>
        this.prisma.point.update({ where: { id: u.id }, data: { x: u.x, y: u.y, z: u.z } }),
      ),
    );
  }
}
