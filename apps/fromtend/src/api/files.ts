import { get } from './client'
import type { FileInfo } from '../types'

export function list(dir: string): Promise<FileInfo[]> {
  return get('/files/list', { params: { dir } })
}

export function getThumbnail(path: string): string {
  return `/api/files/thumbnail?path=${encodeURIComponent(path)}`
}

export function getRawUrl(path: string): string {
  return `/api/files/raw?path=${encodeURIComponent(path)}`
}
