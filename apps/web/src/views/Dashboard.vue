<template>
  <div class="page">
    <h2 style="color:#38bdf8">监控大屏</h2>
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6"><div class="card"><div class="num">{{ stats.cams }}</div><div>摄像头</div></div></el-col>
      <el-col :span="6"><div class="card"><div class="num">{{ stats.online }}</div><div>在线</div></div></el-col>
      <el-col :span="6"><div class="card"><div class="num">{{ stats.maps }}</div><div>场景</div></div></el-col>
      <el-col :span="6"><div class="card"><div class="num">{{ stats.points }}</div><div>点位</div></div></el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="8" v-for="m in maps" :key="m.id">
        <div class="map-card" @click="$router.push('/view/' + m.id)">
          <div class="map-title">{{ m.name }} <el-tag size="small">{{ m.type === 'MODEL_3D' ? '3D' : '2D' }}</el-tag></div>
          <div class="map-meta">{{ m._count.points }} 个点位</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { mapApi, cameraApi } from '../api';

const maps = ref<any[]>([]);
const stats = reactive({ cams: 0, online: 0, maps: 0, points: 0 });

onMounted(async () => {
  maps.value = await mapApi.list();
  const cams: any = await cameraApi.list();
  stats.cams = cams.length;
  stats.online = cams.filter((c: any) => c.online).length;
  stats.maps = maps.value.length;
  stats.points = maps.value.reduce((s, m) => s + (m._count?.points || 0), 0);
});
</script>

<style scoped>
.card { background: #0e1421; border: 1px solid #1e293b; border-radius: 6px; padding: 24px; text-align: center; }
.num { font-size: 36px; color: #38bdf8; font-weight: bold; }
.map-card { background: #0e1421; border: 1px solid #1e293b; border-radius: 6px; padding: 20px; cursor: pointer; transition: all .2s; }
.map-card:hover { border-color: #38bdf8; box-shadow: 0 0 20px rgba(56,189,248,.2); }
.map-title { font-size: 16px; margin-bottom: 6px; }
.map-meta { color: #64748b; font-size: 12px; }
</style>
