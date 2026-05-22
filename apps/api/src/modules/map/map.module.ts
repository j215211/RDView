import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
fs.mkdirSync(join(uploadDir, 'maps'), { recursive: true });

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(uploadDir, 'maps'),
        filename: (req, file, cb) => cb(null, `${uuid()}${extname(file.originalname).toLowerCase()}`),
      }),
      limits: { fileSize: 200 * 1024 * 1024 }, // 200MB (3D 模型可能很大)
      fileFilter: (req, file, cb) => {
        const ok = /\.(jpg|jpeg|png|svg|gif|webp|glb|gltf)$/i.test(file.originalname);
        cb(ok ? null : new Error('仅支持图片 (jpg/png/svg/webp) 或 3D 模型 (glb/gltf)'), ok);
      },
    }),
  ],
  controllers: [MapController],
  providers: [MapService],
  exports: [MapService],
})
export class MapModule {}
