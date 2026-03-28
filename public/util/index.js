

// 工具函数 - 格式化文件大小
export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 工具函数 - 格式化日期
export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}
