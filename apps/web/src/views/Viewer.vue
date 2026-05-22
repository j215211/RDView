<template>
  <div class="viewer" v-if="map">
    <div class="hud-top">
      <span class="title">{{ map.name }}</span>
      <span class="meta">{{ points.length }} 个监控点 · {{ onlineCount }} 在线</span>
      <span class="flex-1"></span>
      <el-button size="small" @click="$router.back()">返回</el-button>
    </div>
    <div class="canvas" v-if="map.type === 'IMAGE_2D'">
      <img :src="map.filePath" class="bg" />
      <div
        v-for="p in points"
        :key="p.id"
        class="point"
        :class="{ online: p.camera?.online }"
        :style="{ left: p.x * 100 + '%', top: p.y * 100 + '%' }"
        @click="openPlayer(p)"
      >
        <div class="pulse"></div>
        <span class="lbl">{{ p.label || p.camera?.name }}</span>
      </div>
    </div>
    <div v-else class="placeholder">3D 渲染开发中:Three.js 加载 {{ map.filePath }} 并叠加点位</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mapApi } from '../api';

const route = useRoute();
const router = useRouter();
const map = ref<any>(null);
const points = ref<any[]>([]);
const onlineCount = computed(() => points.value.filter(p => p.camera?.online).length);

onMounted(async () => {
  map.value = await mapApi.get(Number(route.params.id));
  points.value = map.value.points || [];
});

function openPlayer(p: any) {
  if (!p.cameraId) return;
  router.push(`/players?cams=${p.cameraId}`);
}
</script>

<style scoped>
.viewer { position: fixed; inset: 0; background: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%); }
.hud-top { position: absolute; top: 0; left: 0; right: 0; height: 50px; display: flex; align-items: center; gap: 16px;
  padding: 0 20px; background: linear-gradient(180deg, rgba(15,23,42,.9), transparent); z-index: 10; color: #38bdf8; }
.title { font-size: 18px; letter-spacing: 2px; }
.meta { color: #64748b; font-size: 12px; }
.flex-1 { flex: 1; }
.canvas { position: absolute; inset: 50px 0 0 0; }
.bg { width: 100%; height: 100%; object-fit: contain; }
.point { position: absolute; transform: translate(-50%, -50%); cursor: pointer; }
.point .pulse { width: 16px; height: 16px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 12px #ef4444; }
.point.online .pulse { background: #22c55e; box-shadow: 0 0 14px #22c55e; animation: pulse 1.5s infinite; }
.point .lbl { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); white-space: nowrap;
  color: #cbd5e1; background: rgba(15,23,42,.7); padding: 2px 6px; border-radius: 3px; font-size: 11px; }
@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.5); opacity: .6 } }
.placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #64748b; }
</style>
