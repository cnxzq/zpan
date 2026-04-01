// LocalStorage helpers

export function storageGet<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore
  }
}

export function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore
  }
}

// Storage keys
export const STORAGE_KEYS = {
  LAYOUT_PREFERENCE: 'zpan-layout-preference',
} as const
