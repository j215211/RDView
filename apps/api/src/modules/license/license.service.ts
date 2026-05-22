import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';
import * as os from 'os';
import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import { join } from 'path';

/**
 * 离线 License:
 *   license.lic = base64( JSON { payload, sig } )
 *   payload     = { customer, machineFingerprint, maxCameras, expireAt, issuedAt }
 *   sig         = RSA-SHA256 私钥签名 payload(JSON.stringify 后)
 *
 * 验证:
 *   1. 公钥验签
 *   2. 指纹匹配 (CPU + 主板 UUID + 任一网卡 MAC,3 项中 ≥2 项匹配)
 *   3. 未过期
 */
interface LicensePayload {
  customer: string;
  machineFingerprint: { cpu?: string; board?: string; macs?: string[] };
  maxCameras: number;
  expireAt: string; // ISO date
  issuedAt: string;
}

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);
  private cached: { ok: boolean; payload?: LicensePayload; reason?: string } | null = null;

  constructor(private prisma: PrismaService) {}

  fingerprint() {
    let cpu = '';
    let board = '';
    try { cpu = execSync('cat /proc/cpuinfo | grep -m1 "Serial\\|processor"').toString().trim(); } catch {}
    try { board = execSync('cat /sys/class/dmi/id/board_serial 2>/dev/null || cat /etc/machine-id').toString().trim(); } catch {}
    const macs = Object.values(os.networkInterfaces())
      .flat()
      .filter((n: any) => n && !n.internal && n.mac && n.mac !== '00:00:00:00:00:00')
      .map((n: any) => n.mac);
    return {
      cpu: cpu ? crypto.createHash('sha256').update(cpu).digest('hex').slice(0, 16) : undefined,
      board: board ? crypto.createHash('sha256').update(board).digest('hex').slice(0, 16) : undefined,
      macs,
    };
  }

  private async pubKey(): Promise<string> {
    const path = process.env.LICENSE_PUBKEY_PATH || join(process.cwd(), 'keys', 'public.pem');
    return fs.readFile(path, 'utf-8');
  }

  async verify(content: string): Promise<{ ok: boolean; payload?: LicensePayload; reason?: string }> {
    try {
      const raw = JSON.parse(Buffer.from(content.trim(), 'base64').toString('utf-8'));
      const payload: LicensePayload = raw.payload;
      const sig: string = raw.sig;
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(JSON.stringify(payload));
      const pub = await this.pubKey();
      const sigOk = verifier.verify(pub, Buffer.from(sig, 'base64'));
      if (!sigOk) return { ok: false, reason: '签名无效' };

      // 指纹匹配
      const fp = this.fingerprint();
      const lfp = payload.machineFingerprint || {};
      let match = 0;
      if (lfp.cpu && lfp.cpu === fp.cpu) match++;
      if (lfp.board && lfp.board === fp.board) match++;
      if (lfp.macs && fp.macs.some((m) => lfp.macs!.includes(m))) match++;
      if (match < 2) return { ok: false, reason: `机器指纹不匹配 (${match}/3)` };

      if (new Date(payload.expireAt).getTime() < Date.now()) {
        return { ok: false, reason: '许可证已过期' };
      }
      return { ok: true, payload };
    } catch (e: any) {
      return { ok: false, reason: `解析失败: ${e.message}` };
    }
  }

  async install(content: string) {
    const r = await this.verify(content);
    if (!r.ok) throw new BadRequestException(r.reason);
    const p = r.payload!;
    // 留一条记录
    await this.prisma.license.create({
      data: {
        customer: p.customer,
        maxCameras: p.maxCameras,
        expireAt: new Date(p.expireAt),
        content,
        machineFp: JSON.stringify(p.machineFingerprint),
      },
    });
    this.cached = r;
    // 写入磁盘(供下次启动加载)
    const path = process.env.LICENSE_FILE_PATH || join(process.cwd(), 'license.lic');
    await fs.writeFile(path, content, 'utf-8');
    return { ok: true, payload: p };
  }

  async status() {
    if (this.cached) return this.cached;
    const path = process.env.LICENSE_FILE_PATH || join(process.cwd(), 'license.lic');
    try {
      const content = await fs.readFile(path, 'utf-8');
      this.cached = await this.verify(content);
    } catch {
      this.cached = { ok: false, reason: '未安装许可证(试用模式,限 4 个摄像头)' };
    }
    return this.cached;
  }
}
