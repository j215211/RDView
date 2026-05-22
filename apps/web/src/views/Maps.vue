<template>
  <div class="page">
    <div class="toolbar">
      <el-upload :show-file-list="false" :before-upload="onUpload" :accept="'.jpg,.jpeg,.png,.svg,.webp,.glb,.gltf'">
        <el-button type="primary">上传场景 (图片/3D 模型)</el-button>
      </el-upload>
      <span style="color:#64748b">支持 jpg/png/svg/webp/glb/gltf,单文件最大 200MB</span>
    </div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="m in list" :key="m.id">
        <div class="card">
          <div class="thumb">
            <img v-if="m.type === 'IMAGE_2D'" :src="m.filePath" />
            <div v-else class="model3d">🧊 3D 模型</div>
          </div>
          <div style="padding: 12px">
            <div style="font-size:15px">{{ m.name }} <el-tag size="small">{{ m.type === 'MODEL_3D' ? '3D' : '2D' }}</el-tag></div>
            <div style="color:#64748b;font-size:12px;margin:4px 0 10px">{{ m._count.points }} 个点位</div>
            <el-button size="small" @click="$router.push(`/maps/${m.id}/edit`)">编辑点位</el-button>
            <el-button size="small" @click="$router.push(`/view/${m.id}`)">预览</el-button>
            <el-button size="small" type="danger" @click="remove(m)">删除</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { mapApi } from '../api';

const list = ref<any[]>([]);
async function load() { list.value = await mapApi.list(); }
onMounted(load);

async function onUpload(file: File) {
  const name = await ElMessageBox.prompt('场景名称', '上传', { inputValue: file.name }).then(r => r.value).catch(() => null);
  if (!name) return false;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('name', name);
  await mapApi.upload(fd);
  ElMessage.success('上传成功');
  load();
  return false;
}
async function remove(m: any) {
  await ElMessageBox.confirm(`删除场景 ${m.name}?`, '确认');
  await mapApi.remove(m.id); ElMessage.success('已删除'); load();
}
</script>

<style scoped>
.card { background: #0e1421; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
.thumb { height: 140px; background: #060912; display: flex; align-items: center; justify-content: center; }
.thumb img { max-width: 100%; max-height: 100%; }
.model3d { color: #38bdf8; font-size: 32px; }
</style>
