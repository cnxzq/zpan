import client from './client'
import type { UploadResponse } from '../types'

export function uploadFiles(
  files: File[],
  targetDir: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('dir', targetDir)
  files.forEach(file => {
    formData.append('file', file)
  })

  return client.post('/api/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    },
  }).then(res => res.data)
}
