# RDView 监控可视化平台

> 局域网部署的视频监控可视化系统:支持 2D 俯瞰图 + 3D 模型场景,ONVIF 自动扫描,多分屏播放,离线授权。

## 特性

- 🗺️ **场景管理**:支持上传图片(jpg/png/svg/webp)和 3D 模型(.glb/.gltf)作为底图
- 📷 **摄像头管理**:CRUD + ONVIF 局域网自动发现(WS-Discovery)
- 📍 **点位编辑**:在底图上点击布点,绑定摄像头(归一化坐标,适配任意分辨率)
- 🎬 **实时播放**:RTSP → ZLMediaKit → HTTP-FLV,前端 mpegts.js 解码,1/4/9/16 分屏
- 🔑 **离线授权**:RSA 签名 license 文件 + 机器指纹(CPU + 主板 UUID + MAC,3 项中 ≥2 项匹配)
- 🐳 **一键部署**:docker-compose,适合工控机/迷你 PC 单机部署

## 技术栈

| 模块 | 选型 |
|------|------|
| 后端 | NestJS 10 + Prisma + PostgreSQL + JWT |
| 前端 | Vue3 + Vite + Element Plus + Pinia |
| 流媒体 | ZLMediaKit (RTSP 拉流 → HTTP-FLV 推送) |
| 视频播放 | mpegts.js (HTTP-FLV) |
| 3D 渲染 | Three.js + GLTFLoader |
| ONVIF | 官方 `onvif` 包 (WS-Discovery + Device/Media Service) |
| 部署 | Docker Compose,host 网络模式(便于多播扫描) |

## 快速开始

### 推荐硬件

- CPU:Intel N100 / i3 及以上
- 内存:8GB+
- 存储:128GB SSD(系统) + 1TB HDD(选配,如需本地录像)
- 网卡:有线千兆,与摄像头同一局域网

### 一键部署

```bash
git clone https://github.com/j215211/RDView.git
cd RDView

# 生成 license 公私钥对 (首次部署)
mkdir -p apps/api/keys
openssl genrsa -out apps/api/keys/private.pem 2048
openssl rsa -in apps/api/keys/private.pem -pubout -out apps/api/keys/public.pem

# 启动
docker compose up -d
```

启动后访问 `http://<服务器IP>`,默认账号:

- 用户名:`admin`
- 密码:`admin123`

> ⚠️ **首次登录后请立即在「用户管理」中修改密码**

### 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | Nginx (Web) | 浏览器访问 |
| 3000 | NestJS API | 内部接口 |
| 5432 | PostgreSQL | 数据库 |
| 554 | ZLM RTSP | 摄像头拉流 |
| 8080 | ZLM HTTP-FLV | 浏览器播放 |
| 3702 | UDP | ONVIF WS-Discovery (多播) |

> ONVIF 多播扫描需要 ZLM/API 容器使用 `network_mode: host`,docker-compose.yml 已配置。

## 使用流程

1. **上传场景**:进入 `场景管理` → 上传园区俯瞰图(.jpg)或 3D 模型(.glb)
2. **添加摄像头**:进入 `摄像头管理` → 点击「ONVIF 局域网扫描」自动发现,或手动填写 IP/RTSP
3. **布点**:在场景上点击空白处新增点位,点击点位绑定到具体摄像头
4. **预览**:回到 `监控大屏` → 点击场景卡片进入预览,点击亮点弹出视频
5. **多分屏**:进入 `多分屏` 选 1/4/9/16 画面,选多个摄像头同时播放

## 项目结构

```
RDView/
├── apps/
│   ├── api/                 # NestJS 后端
│   │   ├── src/modules/
│   │   │   ├── auth/        # 登录 + JWT
│   │   │   ├── user/        # 用户管理
│   │   │   ├── camera/      # 摄像头 CRUD
│   │   │   ├── map/         # 场景上传管理 (Multer)
│   │   │   ├── point/       # 点位 CRUD + 批量移动
│   │   │   ├── onvif/       # ONVIF 扫描 + 设备探测
│   │   │   ├── stream/      # ZLMediaKit 集成
│   │   │   └── license/     # RSA 离线授权
│   │   └── prisma/schema.prisma
│   └── web/                 # Vue3 前端
│       └── src/views/
│           ├── Login.vue / Dashboard.vue
│           ├── Cameras.vue / Maps.vue
│           ├── MapEditor.vue (2D 布点编辑器)
│           ├── Viewer.vue (大屏预览)
│           └── MultiPlayer.vue (多分屏)
├── docker/
│   └── zlm/config.ini       # ZLMediaKit 配置
└── docker-compose.yml
```

## License 文件生成 (厂商侧)

```bash
# 1. 客户在系统的「授权」页面获取机器指纹 (JSON)
# 2. 构造 payload
cat > payload.json <<EOF
{
  "customer": "客户名称",
  "machineFingerprint": { ...客户指纹... },
  "maxCameras": 64,
  "expireAt": "2027-12-31T23:59:59Z",
  "issuedAt": "2026-05-22T00:00:00Z"
}
EOF

# 3. 用私钥签名,生成 license.lic
node tools/sign-license.js payload.json private.pem > license.lic
# 4. 发给客户在「授权」页面导入
```

## 路线图

- [x] V0.1 后端基础 + 前端骨架
- [ ] V0.2 3D 模型编辑器(Three.js GLTFLoader + Raycaster 点位放置)
- [ ] V0.3 移动侦测告警(联动 ZLM hook)
- [ ] V0.4 录像回放(ZLM record + 时间轴)
- [ ] V0.5 多服务器集群(单机 → 中心管理)

## License

商业项目,仅供 j215211 内部使用。
