import axios from 'axios';
import { ElMessage } from 'element-plus';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

http.interceptors.request.use((c) => {
  const token = localStorage.getItem('token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

http.interceptors.response.use(
  (r) => r.data,
  (e) => {
    const msg = e.response?.data?.message || e.message || '请求失败';
    ElMessage.error(Array.isArray(msg) ? msg.join(', ') : msg);
    if (e.response?.status === 401) {
      localStorage.removeItem('token');
      location.href = '/login';
    }
    return Promise.reject(e);
  },
);

export default http;
