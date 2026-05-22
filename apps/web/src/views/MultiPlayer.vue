<template>
  <div class="page">
    <div class="toolbar">
      <el-select v-model="layout" style="width:120px">
        <el-option label="1 画面" :value="1" />
        <el-option label="4 画面" :value="4" />
        <el-option label="9 画面" :value="9" />
        <el-option label="16 画面" :value="16" />
      </el-select>
      <el-select v-model="selectedIds" multiple filterable placeholder="选择摄像头" style="width:400px">
        <el-option v-for="c in cams" :key="c.id" :label="`${c.code} - ${c.name}`" :value="c.id" />
      </el-select>
      <el-button type="primary" @click="play">开始播放</el-button>
      <el-button @click="stopAll">全部停止</el-button>
    </div>
    <div class="grid" :style="gridStyle">
      <div v-for="i in layout" :key="i" class="cell">
        <video v-if="streams[i-1]" :ref="el => videoRefs[i-1] = el as HTMLVideoElement" controls autoplay muted></video>
        <div v-else class="empty">画面 {{ i }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { cameraApi, streamApi } from '../api';
// @ts-ignore
import mpegts from 'mpegts.js';

const route = useRoute();
const layout = ref(4);
const cams = ref<any[]>([]);
const selectedIds = ref<number[]>([]);
const streams = ref<any[]>([]);
const videoRefs = ref<HTMLVideoElement[]>([]);
const players: any[] = [];

const gridStyle = computed(() => {
  const n = Math.ceil(Math.sqrt(layout.value));
  return { gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` };
});

onMounted(async () => {
  cams.value = await cameraApi.list();
  const fromUrl = (route.query.cams as string || '').split(',').filter(Boolean).map(Number);
  if (fromUrl.length) { selectedIds.value = fromUrl; play(); }
});

async function play() {
  await stopAll();
  streams.value = new Array(layout.value).fill(null);
  for (let i = 0; i < Math.min(selectedIds.value.length, layout.value); i++) {
    const id = selectedIds.value[i];
    try {
      const r: any = await streamApi.start(id, true);
      streams.value[i] = r;
      // 等待 dom
      await new Promise(r => setTimeout(r, 100));
      const video = videoRefs.value[i];
      if (video && mpegts.isSupported()) {
        const p = mpegts.createPlayer({ type: 'flv', url: r.flv, isLive: true });
        p.attachMediaElement(video);
        p.load();
        p.play();
        players.push(p);
      }
    } catch (e) { console.error(e); }
  }
}

async function stopAll() {
  players.forEach(p => { try { p.destroy(); } catch {} });
  players.length = 0;
  for (const id of selectedIds.value) { try { await streamApi.stop(id, true); } catch {} }
  streams.value = [];
}

onBeforeUnmount(stopAll);
</script>

<style scoped>
.grid { display: grid; gap: 6px; height: calc(100vh - 180px); background: #060912; padding: 6px; }
.cell { background: #000; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.cell video { width: 100%; height: 100%; object-fit: contain; background: #000; }
.empty { color: #475569; font-size: 14px; }
</style>
