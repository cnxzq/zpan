// 认证相关 API
import { http } from '@/api/client';

export async function checkAuthStatus() {
  const res = await http.get('/api/auth/status');
  return res.data;
}

export async function login(username, password) {
  const res = await http.post('/api/auth/login', {
    username,
    password
  });
  return res.data;
}

export async function logout() {
  await http.get('/api/auth/logout');
}
