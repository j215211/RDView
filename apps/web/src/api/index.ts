import http from './http';

export const authApi = {
  login: (username: string, password: string) => http.post('/auth/login', { username, password }),
  me: () => http.get('/auth/me'),
};

export const cameraApi = {
  list: (params?: any) => http.get('/cameras', { params }),
  get: (id: number) => http.get(`/cameras/${id}`),
  create: (d: any) => http.post('/cameras', d),
  update: (id: number, d: any) => http.put(`/cameras/${id}`, d),
  remove: (id: number) => http.delete(`/cameras/${id}`),
};

export const mapApi = {
  list: () => http.get('/maps'),
  get: (id: number) => http.get(`/maps/${id}`),
  upload: (form: FormData) => http.post('/maps', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, d: any) => http.put(`/maps/${id}`, d),
  remove: (id: number) => http.delete(`/maps/${id}`),
};

export const pointApi = {
  listByMap: (mapId: number) => http.get('/points', { params: { mapId } }),
  create: (d: any) => http.post('/points', d),
  update: (id: number, d: any) => http.put(`/points/${id}`, d),
  remove: (id: number) => http.delete(`/points/${id}`),
};

export const onvifApi = {
  discover: (timeout = 3500) => http.get('/onvif/discover', { params: { timeout } }),
  probe: (d: any) => http.post('/onvif/probe', d),
};

export const streamApi = {
  start: (id: number, sub = false) => http.post(`/streams/${id}/start`, null, { params: { sub: sub ? 1 : 0 } }),
  stop: (id: number, sub = false) => http.post(`/streams/${id}/stop`, null, { params: { sub: sub ? 1 : 0 } }),
};

export const userApi = {
  list: () => http.get('/users'),
  create: (d: any) => http.post('/users', d),
  update: (id: number, d: any) => http.put(`/users/${id}`, d),
  remove: (id: number) => http.delete(`/users/${id}`),
};

export const licenseApi = {
  fingerprint: () => http.get('/license/fingerprint'),
  status: () => http.get('/license/status'),
  install: (content: string) => http.post('/license/install', { content }),
};
