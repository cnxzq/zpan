


export interface FileItem {
  name: string
  size: number
  isDirectory?: boolean
  mtimeMs?: number
  [key: string]: any
}
