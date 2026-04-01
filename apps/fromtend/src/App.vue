<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'


const authStore = useAuthStore()
const appStore = useAppStore()

onMounted(async () => {
  await appStore.loadConfig()
  await authStore.checkAuth()
})

</script>

<template>
  <div class="app-container">
    <RouterView class="h-full w-full" />
  </div>
</template>
