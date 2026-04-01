<template>
  <div class="file-item">
    <component :is="file.isDirectory?'div':'a'" download @click="handleItemClick(file)" :href="file.isDirectory?'':fileLink()">
      <div class="thumbnail">
        <div v-if="file.isDirectory" class="folder-icon">📁</div>
        <img v-else-if="isImage(file.name)" :src="thumbnailUrl(file)" :alt="file.name">
        <div v-else class="folder-icon">{{ file.isDirectory ? '📁' : '📄' }}</div>
      </div>
      <div class="file-info">
        <div class="name">{{ file.name }}</div>
        <div class="size">{{ formatSize(file.size) }}</div>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { isImage } from '@/utils/file'
import { formatSize } from '@/utils/format'
import type { FileItem } from './contaitic';

const props = withDefaults(defineProps<{
  file: FileItem
  currentPath?: string
  baseUrl?: string
}>(), {
  currentPath: '',
  baseUrl: ''
})

const emit = defineEmits<{
  (e: 'click', v: FileItem): void
}>()

const fileLink = () => {
  const path = props.currentPath ? `${props.currentPath}/${props.file.name}` : props.file.name
  return props.baseUrl + '/raw/' + path
}


const thumbnailUrl = (file: FileItem) => {
  const path = props.currentPath ? `${props.currentPath}/${file.name}` : file.name
  return props.baseUrl + '/api/thumbnail?path=' + encodeURIComponent(path)
}

const handleItemClick = (file: FileItem) => {
  if(file.isDirectory){
    emit('click', file)
  }
}
</script>