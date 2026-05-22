import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

/**
 * ZLMediaKit 集成:
 * - 调用 ZLM HTTP API addStreamProxy 将摄像头 RTSP 拉到 ZLM
 * - 前端通过 http://zlm:8080/live/{streamId}.flv 播放 (HTTP-FLV)
 * - 默认 vhost = __defaultVhost__, app = live
 */
@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);
  private readonly host: string;
  private readonly httpPort: number;
  private readonly secret: string;

  constructor(private cfg: ConfigService, private prisma: PrismaService) {
    this.host = cfg.get<string>('ZLM_HOST') || '127.0.0.1';
    this.httpPort = Number(cfg.get<string>('ZLM_HTTP_PORT') || 8080);
    this.secret = cfg.get<string>('ZLM_SECRET') || '';
  }

  private apiUrl(method: string, params: Record<string, any>) {
    const usp = new URLSearchParams({ secret: this.secret, ...params } as any);
    return `http://${this.host}:${this.httpPort}/index/api/${method}?${usp.toString()}`;
  }

  private async call(method: string, params: Record<string, any>): Promise<any> {
    const url = this.apiUrl(method, params);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ZLM ${method} HTTP ${res.status}`);
    const json: any = await res.json();
    if (json.code !== 0) throw new Error(`ZLM ${method} code=${json.code} msg=${json.msg}`);
    return json;
  }

  private streamId(cameraId: number, sub = false) {
    return `cam_${cameraId}${sub ? '_sub' : ''}`;
  }

  /**
   * 启动拉流:返回前端可播放的 HTTP-FLV / HLS 地址
   */
  async start(cameraId: number, sub = false) {
    const cam = await this.prisma.camera.findUnique({ where: { id: cameraId } });
    if (!cam) throw new BadRequestException('摄像头不存在');
    const rtsp = sub ? cam.rtspSub : cam.rtspMain;
    if (!rtsp) throw new BadRequestException('未配置 RTSP 地址');

    const stream = this.streamId(cameraId, sub);
    try {
      await this.call('addStreamProxy', {
        vhost: '__defaultVhost__',
        app: 'live',
        stream,
        url: rtsp,
        retry_count: -1,
        rtp_type: 0, // 0=TCP,1=UDP,2=组播
      });
    } catch (e: any) {
      // 已存在则忽略
      if (!String(e.message).includes('already exists')) this.logger.warn(`addStreamProxy: ${e.message}`);
    }

    // 通过前端可访问的地址返回(浏览器走 host 网络)
    const pubHost = this.cfg.get<string>('ZLM_PUBLIC_HOST') || this.host;
    return {
      stream,
      flv: `http://${pubHost}:${this.httpPort}/live/${stream}.live.flv`,
      hls: `http://${pubHost}:${this.httpPort}/live/${stream}/hls.m3u8`,
      ws_flv: `ws://${pubHost}:${this.httpPort}/live/${stream}.live.flv`,
    };
  }

  async stop(cameraId: number, sub = false) {
    const stream = this.streamId(cameraId, sub);
    try {
      await this.call('close_streams', {
        vhost: '__defaultVhost__',
        app: 'live',
        stream,
        force: 1,
      });
      return { ok: true };
    } catch (e: any) {
      this.logger.warn(`close_streams: ${e.message}`);
      return { ok: false, error: e.message };
    }
  }

  async snapshot(cameraId: number) {
    const stream = this.streamId(cameraId, true);
    const url = this.apiUrl('getSnap', {
      url: `rtmp://127.0.0.1/live/${stream}`,
      timeout_sec: 5,
      expire_sec: 5,
    });
    return { url };
  }

  /**
   * ZLM 推流钩子:可用于鉴权、上线统计
   */
  onHook(event: string, body: any) {
    this.logger.log(`zlm hook ${event}: ${JSON.stringify(body).slice(0, 200)}`);
    // 默认放行
    return { code: 0, msg: 'success' };
  }
}
