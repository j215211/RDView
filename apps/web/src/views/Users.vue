<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" @click="openEdit()">新增用户</el-button>
    </div>
    <el-table :data="list" border>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="姓名" />
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row)" v-if="row.username !== 'admin'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="visible" :title="form.id ? '编辑用户' : '新增用户'" width="480px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名"><el-input v-model="form.username" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" :placeholder="form.id ? '留空则不修改' : ''" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="操作员" value="OPERATOR" />
            <el-option label="观看者" value="VIEWER" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用" v-if="form.id"><el-switch v-model="form.enabled" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { userApi } from '../api';

const list = ref<any[]>([]);
const visible = ref(false);
const form = reactive<any>({});

async function load() { list.value = await userApi.list(); }
onMounted(load);

function openEdit(row?: any) {
  Object.keys(form).forEach(k => delete form[k]);
  if (row) Object.assign(form, row, { password: '' }); else Object.assign(form, { role: 'OPERATOR', enabled: true });
  visible.value = true;
}
async function save() {
  if (form.id) {
    const d: any = { ...form }; if (!d.password) delete d.password;
    await userApi.update(form.id, d);
  } else {
    await userApi.create(form);
  }
  ElMessage.success('已保存'); visible.value = false; load();
}
async function remove(row: any) {
  await ElMessageBox.confirm(`删除用户 ${row.username}?`, '确认');
  await userApi.remove(row.id); ElMessage.success('已删除'); load();
}
</script>
