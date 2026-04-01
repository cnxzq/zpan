import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as configApi from '../api/config'
import { storageGet, storageSet, STORAGE_KEYS } from '../utils/storage'
import type { LayoutType } from '../types'

export const useAppStore = defineStore('app', () => {
  const layout = ref<LayoutType>(
    storageGet<LayoutType>(STORAGE_KEYS.LAYOUT_PREFERENCE, 'list')
  )
  const instanceName = ref('ZPan')
  const baseUrl = ref('')
  const currentDir = ref('')

  function setCurrentDir(p: string) {
    currentDir.value = p;
    const router = useRouter();
    router.replace({
      query: {
        ...router.currentRoute.value.query, // 保留其他所有 query
        dir: p
      }
    })
  }

  function setLayout(newLayout: LayoutType): void {
    layout.value = newLayout
    storageSet(STORAGE_KEYS.LAYOUT_PREFERENCE, newLayout)
  }

  async function loadConfig(): Promise<void> {
    try {
      const res = await configApi.getConfig()
      instanceName.value = res.name || 'ZPan'
      baseUrl.value = res.baseUrl || ''
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  return {
    layout,
    instanceName,
    baseUrl,
    setLayout,
    loadConfig,
    currentDir,
    setCurrentDir,
  }
})
