<template>
  <div class="page" style="max-width: 720px">
    <h2 style="color:#38bdf8">系统授权</h2>
    <el-card style="margin-bottom: 16px">
      <h3>1. 当前状态</h3>
      <div v-if="status">
        <el-tag :type="status.ok ? 'success' : 'danger'">{{ status.ok ? '已授权' : '未授权 / 试用' }}</el-tag>
        <div v-if="status.ok && status.payload" style="margin-top:12px;line-height:1.8">
          <div>客户:{{ status.payload.customer }}</div>
          <div>最大摄像头:{{ status.payload.maxCameras }}</div>
          <div>到期时间:{{ status.payload.expireAt }}</div>
        </div>
        <div v-else style="color:#ef4444;margin-top:8px">原因:{{ status.reason }}</div>
      </div>
    </el-card>
    <el-card style="margin-bottom: 16px">
      <h3>2. 机器指纹</h3>
      <p style="color:#64748b;font-size:12px">将此指纹发给厂商生成 license.lic 文件</p>
      <el-input type="textarea" :rows="4" :model-value="fp ? JSON.stringify(fp, null, 2) : ''" readonly />
    </el-card>
    <el-card>
      <h3>3. 导入许可证</h3>
      <el-input type="textarea" :rows="6" v-model="licenseText" placeholder="粘贴 license.lic 文件内容(base64)" />
      <el-button type="primary" style="margin-top:12px" @click="install">导入</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { licenseApi } from '../api';

const fp = ref<any>(null);
const status = ref<any>(null);
const licenseText = ref('');

async function load() {
  fp.value = await licenseApi.fingerprint();
  status.value = await licenseApi.status();
}
onMounted(load);

async function install() {
  await licenseApi.install(licenseText.value.trim());
  ElMessage.success('授权已生效');
  load();
}
</script>

<style scoped>
h3 { margin: 0 0 12px; color: #38bdf8; }
:deep(.el-card) { background: #0e1421; border-color: #1e293b; color: #cbd5e1; }
</style>
