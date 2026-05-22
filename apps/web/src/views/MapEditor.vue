<template>
  <div class="page" style="height: calc(100vh - 100px); display: flex; flex-direction: column">
    <div class="toolbar">
      <span>场景: <b>{{ map?.name }}</b> ({{ map?.type === 'MODEL_3D' ? '3D' : '2D' }})</span>
      <el-button size="small" @click="$router.back()">返回</el-button>
      <span class="flex-1"></span>
      <span style="color:#64748b">{{ map?.type === 'MODEL_3D' ? '3D 编辑器规划中,可使用 API 直接配置坐标' : '在图片上点击空白处新增点位,点击点位可绑定摄像头' }}</span>
    </div>
    <div ref="boxRef" class="canvas" v-if="map?.type === 'IMAGE_2D'" @click="onCanvasClick">
      <img :src="map.filePath" class="bg" @load="onImgLoad" ref="imgRef" />
      <div
        v-for="p in points"
        :key="p.id"
        class="point"
        :style="{ left: p.x * 100 + '%', top: p.y * 100 + '%', background: p.iconColor || '#38bdf8' }"
        @click.stop="onPointClick(p)"
      >📷</div>
    </div>
    <div v-else class="placeholder">3D 编辑器开发中。已上传 .glb 文件,可调用 API <code>POST /points</code> 写入坐标(归一化 0~1)。</div>

    <el-dialog v-model="bindVisible" title="绑定摄像头" width="400px">
      <el-form>
        <el-form-item label="摄像头">
          <el-select v-model="bindForm.cameraId" filterable clearable placeholder="选择摄像头" style="width:100%">
            <el-option v-for="c in cams" :key="c.id" :label="`${c.code} - ${c.name}`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="bindForm.label" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="danger" @click="removePoint">删除点位</el-button>
        <span class="flex-1"></span>
        <el-button @click="bindVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBind">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { mapApi, pointApi, cameraApi } from '../api';

const route = useRoute();
const mapId = Number(route.params.id);
const map = ref<any>(null);
const points = ref<any[]>([]);
const cams = ref<any[]>([]);
const bindVisible = ref(false);
const bindForm = reactive<any>({});

async function load() {
  map.value = await mapApi.get(mapId);
  points.value = map.value.points || [];
  cams.value = await cameraApi.list();
}
onMounted(load);

function onImgLoad() {}

async function onCanvasClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const p = await pointApi.create({ mapId, x, y, label: '新点位' });
  points.value.push(p);
}

function onPointClick(p: any) {
  Object.keys(bindForm).forEach(k => delete bindForm[k]);
  Object.assign(bindForm, { id: p.id, cameraId: p.cameraId, label: p.label });
  bindVisible.value = true;
}
async function saveBind() {
  await pointApi.update(bindForm.id, { cameraId: bindForm.cameraId || null, label: bindForm.label });
  ElMessage.success('已保存');
  bindVisible.value = false;
  load();
}
async function removePoint() {
  await pointApi.remove(bindForm.id);
  bindVisible.value = false;
  load();
}
</script>

<style scoped>
.canvas { position: relative; flex: 1; background: #060912; overflow: hidden; }
.bg { display: block; max-width: 100%; max-height: 100%; margin: 0 auto; }
.point { position: absolute; transform: translate(-50%, -50%); width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;
  box-shadow: 0 0 12px rgba(56,189,248,.6); }
.placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: #64748b; }
</style>
