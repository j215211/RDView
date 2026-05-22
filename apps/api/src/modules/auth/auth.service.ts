import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.enabled) throw new UnauthorizedException('账号不存在或已禁用');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('密码错误');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.prisma.operationLog.create({
      data: { userId: user.id, action: 'login', ip },
    });

    const token = this.jwt.sign({ sub: user.id, username: user.username, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
      },
    };
  }
}
