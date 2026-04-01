<template>

    <div class="header">
        <h1>{{ instanceName }}</h1>
        <div class="toolbar">
            <Breadcrumbs :path="appStore.currentDir" @navigate="onNavigate" />
            <div class="actions">
                <div class="layout-toggle">
                    <button :class="{ active: appStore.layout === 'grid' }" @click="changeLayout('grid')">
                        📷 Grid
                    </button>
                    <button :class="{ active: appStore.layout === 'list' }" @click="changeLayout('list')">
                        📋 List
                    </button>
                </div>
                <button class="upload-btn" @click="openUpload">📤 上传文件</button>
                <button class="logout-btn" @click="handleLogout">🚪 退出</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { useAppStore } from '@/store/app';
import Breadcrumbs from './Breadcrumbs.vue'
import { useAuthStore } from '@/store/auth'

const appStore = useAppStore();
const authStore = useAuthStore();

// 引入你的面包屑组件

// 1. Props 类型定义
const props = withDefaults(defineProps<{
    loggedIn?: boolean
    instanceName?: string
}>(), {
    loggedIn: false,
    currentPath: '',
    instanceName: 'ZPan'
})

// 2. 自定义事件定义
const emit = defineEmits<{
    'layout-change': [layout: 'grid' | 'list']
    'open-upload': []
    'logout': []
    'navigate': [parts: string[]]
}>()

const handleLogout = async () => {
    await authStore.logout()
    authStore.loggedIn = false;
    window.location.reload()
}

// 3. 方法
const changeLayout = (layout: 'grid' | 'list') => {
    appStore.setLayout(layout)
}

const onNavigate = (parts: string[]) => {
    emit('navigate', parts)
}

const openUpload = () => {
    emit('open-upload')
}
</script>

<style scoped>

    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 15px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    
    .actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .layout-toggle button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: #f5f5f5;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
    }

    .layout-toggle button.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .upload-btn {
      display: inline-block;
      padding: 8px 16px;
      background: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      border: none;
    }

    .upload-btn:hover {
      background: #218838;
    }

    .logout-btn {
      display: inline-block;
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      border: none;
    }

    .logout-btn:hover {
      background: #c82333;
    }
</style>