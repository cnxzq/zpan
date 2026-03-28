// axios 实例配置
import axios from 'axios';

// 创建自定义 axios 实例
export const http = axios.create({
  // baseURL 将从应用配置动态设置
});

// 可以在这里添加请求/响应拦截器
// http.interceptors.request.use(...);
// http.interceptors.response.use(...);
