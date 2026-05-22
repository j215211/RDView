import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const onvif = require('onvif');

export interface DiscoveredDevice {
  xaddrs: string[];
  name?: string;
  hardware?: string;
  ip?: string;
  port?: number;
}

export interface ProbeResult {
  manufacturer?: string;
  model?: string;
  firmware?: string;
  serial?: string;
  rtspMain?: string;
  rtspSub?: string;
  snapshot?: string;
}

@Injectable()
export class OnvifService {
  private readonly logger = new Logger(OnvifService.name);

  /**
   * WS-Discovery 多播扫描 (3.5s timeout)
   */
  discover(timeout = 3500): Promise<DiscoveredDevice[]> {
    return new Promise((resolve) => {
      const list: DiscoveredDevice[] = [];
      onvif.Discovery.on('device', (cam: any, rinfo: any) => {
        list.push({
          xaddrs: cam.xaddrs || [],
          name: cam.name,
          hardware: cam.hardware,
          ip: rinfo?.address,
          port: rinfo?.port,
        });
      });
      onvif.Discovery.on('error', (e: any) => this.logger.warn(`discovery error: ${e?.message}`));
      onvif.Discovery.probe({ timeout, resolve: false }, () => resolve(list));
    });
  }

  /**
   * 探测单个设备:获取详细信息和 RTSP 流地址
   */
  probe(host: string, port: number, username: string, password: string): Promise<ProbeResult> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line new-cap
      new onvif.Cam({ hostname: host, port, username, password, timeout: 5000 }, function (err: any) {
        if (err) return reject(err);
        const self: any = this;
        const out: ProbeResult = {};
        self.getDeviceInformation((e: any, info: any) => {
          if (!e && info) {
            out.manufacturer = info.manufacturer;
            out.model = info.model;
            out.firmware = info.firmwareVersion;
            out.serial = info.serialNumber;
          }
          self.getStreamUri({ protocol: 'RTSP' }, (e2: any, s: any) => {
            if (!e2 && s) out.rtspMain = s.uri;
            self.getSnapshotUri((e3: any, snap: any) => {
              if (!e3 && snap) out.snapshot = snap.uri;
              resolve(out);
            });
          });
        });
      });
    });
  }
}
