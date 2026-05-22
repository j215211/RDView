<template>
  <div class="login-bg">
    <div class="login-box">
      <h1>RDView 监控可视化平台</h1>
      <el-form @submit.prevent="onSubmit">
        <el-input v-model="form.username" placeholder="用户名" size="large" style="margin-bottom: 12px" />
        <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password style="margin-bottom: 16px" @keyup.enter="onSubmit" />
        <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="onSubmit">登录</el-button>
      </el-form>
      <p class="tip">默认账号 admin / admin123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { authApi } from '../api';
import { useAuthStore } from '../stores/auth';

const form = reactive({ username: 'admin', password: 'admin123' });
const loading = ref(false);
const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  loading.value = true;
  try {
    const r: any = await authApi.login(form.username, form.password);
    auth.setLogin(r.access_token, r.user);
    ElMessage.success('登录成功');
    router.push('/');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-bg { height: 100%; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 50% 30%, #1e3a5f 0%, #0a0e1a 70%); }
.login-box { width: 380px; padding: 36px; background: rgba(15,23,42,.85); border: 1px solid #1e293b;
  border-radius: 8px; box-shadow: 0 0 60px rgba(56,189,248,.15); }
h1 { color: #38bdf8; text-align: center; font-size: 22px; margin: 0 0 28px; letter-spacing: 2px; }
.tip { color: #64748b; font-size: 12px; text-align: center; margin: 16px 0 0; }
</style>
