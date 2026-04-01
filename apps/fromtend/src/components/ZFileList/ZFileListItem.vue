<template>
    <div class="file-item">
        <span class="icon">
            <span>{{ file.isDirectory ? '📁' : '📄' }}</span>
        </span>
        <span class="name" @click="emit('click',file)">{{ file.name }}</span>
        <span class="size">{{ formatSize(file.size) }}</span>
        <span class="date">{{ formatDate(file.mtimeMs) }}</span>
    </div>
</template>

<script setup lang="ts">
import { formatDate, formatSize } from '@/utils/format'
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
  (e:'click',v:FileItem):void
}>()
</script>