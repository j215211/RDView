import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MapType, Prisma } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.map.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { points: true } } },
    });
  }

  async get(id: number) {
    const m = await this.prisma.map.findUnique({
      where: { id },
      include: {
        points: { include: { camera: true } },
        children: true,
      },
    });
    if (!m) throw new NotFoundException('场景不存在');
    return m;
  }

  async createFromUpload(
    file: Express.Multer.File,
    body: { name: string; type?: string; parentId?: string },
  ) {
    if (!file) throw new BadRequestException('未上传文件');
    const isModel = /\.(glb|gltf)$/i.test(file.filename);
    const type: MapType = body.type === 'MODEL_3D' || isModel ? MapType.MODEL_3D : MapType.IMAGE_2D;
    const relPath = `/uploads/maps/${file.filename}`;

    const data: Prisma.MapCreateInput = {
      name: body.name || file.originalname,
      type,
      filePath: relPath,
      ...(body.parentId && { parent: { connect: { id: Number(body.parentId) } } }),
    };
    return this.prisma.map.create({ data });
  }

  update(id: number, dto: Partial<{ name: string; sortOrder: number; defaultView: any }>) {
    return this.prisma.map.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const m = await this.prisma.map.findUnique({ where: { id } });
    if (!m) return;
    // 删除磁盘文件
    try {
      const abs = join(process.env.UPLOAD_DIR || process.cwd() + '/uploads', m.filePath.replace('/uploads/', ''));
      await fs.unlink(abs);
    } catch {/* ignore */}
    return this.prisma.map.delete({ where: { id } });
  }
}
