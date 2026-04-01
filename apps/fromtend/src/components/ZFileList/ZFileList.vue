<template>
  <div :class="['file-list', layout]">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败: {{ error }}</div>
    <div v-else-if="files.length === 0" class="empty">目录为空</div>
    <template v-else-if="layout === 'grid'">
      <ZFileGridItem @click="f=>emit('item-click',f)" v-for="file in files" :key="file.name" :file="file" :current-path="currentPath"
        :base-url="baseUrl" />
    </template>
    <template v-else-if="layout === 'list'">
      <ZFileListItem @click="f=>emit('item-click',f)" v-for="file in files" :key="file.name" :file="file" :current-path="currentPath"
        :base-url="baseUrl" />
    </template>
    <template v-else>错误的 layout 值: {{ layout }}</template>
  </div>
</template>

<script setup lang="ts">

import type { FileItem } from './contaitic';
import ZFileGridItem from './ZFileGridItem.vue';
import ZFileListItem from './ZFileListItem.vue';

const props = withDefaults(defineProps<{
  files?: any[]
  loading?: boolean
  error?: string | null
  layout?: string
  currentPath?: string
  baseUrl?: string
}>(), {
  files: () => [],
  loading: false,
  error: '',
  layout: 'grid',
  currentPath: '',
  baseUrl: ''
})

const emit = defineEmits<{
  (e: 'item-click', file: FileItem): void
}>()

</script>

<style>
/* List Layout */
.file-list.list {
  display: block;
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-list.list .file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.file-list.list .file-item:last-child {
  border-bottom: none;
}

.file-list.list .file-item:hover {
  background: #fafafa;
}

.file-list.list .icon {
  width: 32px;
  margin-right: 12px;
  font-size: 20px;
}

.file-list.list .name {
  flex: 1;
}

.file-list.list .name a {
  color: #333;
  text-decoration: none;
}

.file-list.list .size {
  color: #999;
  font-size: 14px;
  width: 80px;
  text-align: right;
}

.file-list.list .date {
  color: #999;
  font-size: 14px;
  width: 180px;
  text-align: right;
}

/* Grid Layout */
.file-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.file-list.grid .file-item {
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.file-list.grid .file-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-list.grid .thumbnail {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  overflow: hidden;
}

.file-list.grid .thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-list.grid .thumbnail .folder-icon {
  font-size: 48px;
  color: #bbb;
}

.file-list.grid .file-info {
  padding: 10px;
  text-align: center;
}

.file-list.grid .file-info .name {
  word-break: break-all;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.file-list.grid .file-info .size {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.file-item a {
  text-decoration: none;
  color: inherit;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  background: white;
  border-radius: 8px;
}

.error {
  color: #dc3545;
}
</style>