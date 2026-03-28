import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { http } from '@/api/client';
import { getConfig } from '@/api/config';

export const useAppStore = defineStore('app', () => {
  const layout = ref(localStorage.getItem('zpan-layout') || 'grid');
  const baseUrl = ref('');
  const instanceName = ref('ZPan');

  function apiUrl(path) {
    return baseUrl.value + path;
  }

  async function loadConfig() {
    const htmlBaseUrl = location.pathname.split('/').slice(0, -1).join('/');
    baseUrl.value = htmlBaseUrl;
    // 设置 axios 实例的 baseURL
    http.defaults.baseURL = htmlBaseUrl;

    try {
      const data = await getConfig();
      if (data.baseUrl) {
        baseUrl.value = data.baseUrl;
        http.defaults.baseURL = data.baseUrl;
      }
      instanceName.value = data.name || 'ZPan';
    } catch (err) {
      console.error('Failed to load config:', err);
      baseUrl.value = '';
    }
  }

  function setLayout(newLayout) {
    layout.value = newLayout;
  }

  // 监听布局变化保存到本地存储
  watch(layout, (val) => {
    localStorage.setItem('zpan-layout', val);
  });

  return {
    layout,
    baseUrl,
    instanceName,
    loadConfig,
    apiUrl,
    setLayout,
  };
});
