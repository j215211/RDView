import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('../views/Dashboard.vue') },
        { path: 'cameras', component: () => import('../views/Cameras.vue') },
        { path: 'maps', component: () => import('../views/Maps.vue') },
        { path: 'maps/:id/edit', component: () => import('../views/MapEditor.vue') },
        { path: 'view/:id', component: () => import('../views/Viewer.vue') },
        { path: 'players', component: () => import('../views/MultiPlayer.vue') },
        { path: 'users', component: () => import('../views/Users.vue') },
        { path: 'license', component: () => import('../views/License.vue') },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.token) return '/login';
});

export default router;
