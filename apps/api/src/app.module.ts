import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './modules/common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CameraModule } from './modules/camera/camera.module';
import { MapModule } from './modules/map/map.module';
import { PointModule } from './modules/point/point.module';
import { OnvifModule } from './modules/onvif/onvif.module';
import { StreamModule } from './modules/stream/stream.module';
import { LicenseModule } from './modules/license/license.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // 上传文件静态访问 /uploads/xxx
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOAD_DIR || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CameraModule,
    MapModule,
    PointModule,
    OnvifModule,
    StreamModule,
    LicenseModule,
  ],
})
export class AppModule {}
