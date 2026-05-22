<template>
  <el-container style="height: 100%">
    <el-aside width="220px" class="aside">
      <div class="logo">📹 RDView</div>
      <el-menu :default-active="route.path" router background-color="#0e1421" text-color="#cbd5e1" active-text-color="#38bdf8">
        <el-menu-item index="/dashboard">🗺️ 监控大屏</el-menu-item>
        <el-menu-item index="/cameras">📷 摄像头管理</el-menu-item>
        <el-menu-item index="/maps">🌐 场景管理</el-menu-item>
        <el-menu-item index="/players">🖥️ 多分屏</el-menu-item>
        <el-menu-item index="/users">👤 用户管理</el-menu-item>
        <el-menu-item index="/license">🔑 授权</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="flex-1"></div>
        <el-dropdown @command="onCmd">
          <span style="color:#cbd5e1;cursor:pointer">{{ auth.user?.realName || auth.user?.username }} ▾</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main style="background: #0a0e1a">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

function onCmd(c: string) {
  if (c === 'logout') { auth.logout(); router.push('/login'); }
}
</script>

<style scoped>
.aside { background: #0e1421; border-right: 1px solid #1e293b; }
.logo { color: #38bdf8; font-size: 20px; padding: 18px; letter-spacing: 2px; border-bottom: 1px solid #1e293b; }
.header { background: #0e1421; border-bottom: 1px solid #1e293b; display: flex; align-items: center; }
:deep(.el-menu) { border-right: none; }
</style>
