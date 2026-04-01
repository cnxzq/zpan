import { get } from './client'
import type { AppConfig } from '../types'

export function getConfig(): Promise<AppConfig> {
  return get('/config')
}
