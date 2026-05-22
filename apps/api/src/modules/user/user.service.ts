import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

interface CreateUserDto {
  username: string;
  password: string;
  realName?: string;
  role?: Role;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, username: true, realName: true, role: true, enabled: true, createdAt: true },
    });
  }

  async create(dto: CreateUserDto) {
    const dup = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (dup) throw new BadRequestException('用户名已存在');
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        username: dto.username,
        password: hash,
        realName: dto.realName,
        role: dto.role || Role.OPERATOR,
      },
      select: { id: true, username: true, realName: true, role: true, enabled: true },
    });
  }

  async update(id: number, dto: Partial<CreateUserDto> & { enabled?: boolean }) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('用户不存在');
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, realName: true, role: true, enabled: true },
    });
  }

  async remove(id: number) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('用户不存在');
    if (u.username === 'admin') throw new BadRequestException('内置管理员不可删除');
    return this.prisma.user.delete({ where: { id } });
  }
}
