// 配置相关 API
import { http } from '@/api/client';

export async function getConfig() {
  const res = await http.get('/api/config');
  return res.data;
}
