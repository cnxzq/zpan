<template>
    <div class="breadcrumbs">
        <a @click.stop.prevent="appStore.setCurrentDir('')">根目录</a>
        <template v-for="(part, index) in parts" :key="index">
            <span> / </span>
            <a @click="navigateTo(index)" href="#">
                {{ part }}
            </a>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app';

const appStore= useAppStore();

        
// Props
const props = withDefaults(defineProps<{
    path?: string
}>(), {
    path: ''
})

// 自定义事件
const emit = defineEmits<{
    navigate: [parts: string[]]
}>()

// 计算路径片段
const parts = computed(() => {
    if (!props.path) return []
    return props.path.split('/').filter(Boolean)
})

// 导航点击
const navigateTo = (index: number) => {
    emit('navigate', parts.value.slice(0, index + 1))
}
</script>

<style scoped>
/* 可加你的样式 */
.breadcrumbs {
    display: flex;
    gap: 4px;
    align-items: center;
}

.breadcrumbs a {
    cursor: pointer;
    color: #409eff;
    text-decoration: none;
}
</style>

<style scoped>
.breadcrumbs {
    color: #666;
    font-size: 14px;
}

.breadcrumbs a {
    color: #007bff;
    text-decoration: none;
    cursor: pointer;
}

.breadcrumbs a:hover {
    text-decoration: underline;
}
</style>