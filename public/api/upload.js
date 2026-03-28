// 上传相关 API
import { http } from '@/api/client';

export async function uploadFiles(dir, files) {
  const formData = new FormData();
  formData.append('dir', dir);
  files.forEach(file => {
    formData.append('file', file);
  });

  const res = await http.post('/api/upload', formData);
  return res.data;
}
