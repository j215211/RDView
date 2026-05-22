<template>
  <div class="page">
    <div class="toolbar">
      <el-input v-model="q" placeholder="搜索名称/编号" style="width:240px" clearable @change="load" />
      <el-button type="primary" @click="openEdit()">新增摄像头</el-button>
      <el-button @click="discover">ONVIF 局域网扫描</el-button>
      <div class="flex-1"></div>
    </div>
    <el-table :data="list" border>
      <el-table-column prop="code" label="编号" width="140" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="brand" label="厂商" width="120" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.online ? 'success' : 'danger'" size="small">{{ row.online ? '在线' : '离线' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="primary" @click="preview(row)">预览</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editVisible" :title="form.id ? '编辑摄像头' : '新增摄像头'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="编号"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="IP"><el-input v-model="form.ip" /></el-form-item>
        <el-form-item label="端口"><el-input-number v-model="form.port" :min="1" :max="65535" /></el-form-item>
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        <el-form-item label="主码流 RTSP"><el-input v-model="form.rtspMain" placeholder="rtsp://user:pass@ip:554/Streaming/Channels/101" /></el-form-item>
        <el-form-item label="子码流 RTSP"><el-input v-model="form.rtspSub" placeholder="rtsp://user:pass@ip:554/Streaming/Channels/102" /></el-form-item>
        <el-form-item label="厂商"><el-input v-model="form.brand" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="discVisible" title="ONVIF 扫描结果" width="700px">
      <el-table :data="discList" border>
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="name" label="设备" />
        <el-table-column prop="hardware" label="硬件" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="addFromDiscovery(row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cameraApi, onvifApi } from '../api';

const q = ref('');
const list = ref<any[]>([]);
const editVisible = ref(false);
const discVisible = ref(false);
const discList = ref<any[]>([]);
const form = reactive<any>({});

async function load() { list.value = await cameraApi.list({ q: q.value || undefined }); }
onMounted(load);

function openEdit(row?: any) {
  Object.keys(form).forEach(k => delete form[k]);
  if (row) Object.assign(form, row); else Object.assign(form, { port: 80 });
  editVisible.value = true;
}
async function save() {
  if (form.id) await cameraApi.update(form.id, form); else await cameraApi.create(form);
  ElMessage.success('保存成功'); editVisible.value = false; load();
}
async function remove(row: any) {
  await ElMessageBox.confirm(`删除摄像头 ${row.name}?`, '确认');
  await cameraApi.remove(row.id); ElMessage.success('已删除'); load();
}
async function discover() {
  const loading = ElMessage({ message: '扫描中(约 4 秒)...', duration: 0 });
  try {
    discList.value = (await onvifApi.discover(3500) as any).map((d: any) => ({ ...d, name: d.name || d.hardware || d.ip }));
    discVisible.value = true;
  } finally { loading.close(); }
}
function addFromDiscovery(row: any) {
  openEdit({ ip: row.ip, port: 80, name: row.name, code: 'CAM' + Date.now().toString().slice(-6), brand: row.hardware });
  discVisible.value = false;
}
function preview(row: any) {
  window.open(`/players?cams=${row.id}`, '_blank');
}
</script>
