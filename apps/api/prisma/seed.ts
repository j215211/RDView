import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const exist = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!exist) {
    await prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        realName: '系统管理员',
        role: Role.ADMIN,
      },
    });
    console.log('✅ 默认管理员已创建: admin / admin123');
  } else {
    console.log('ℹ️  admin 已存在,跳过');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
