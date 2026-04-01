// File information
export interface FileInfo {
  name: string
  size: number
  mtimeMs: number
  isDirectory: boolean
}

// User information (public, no password)
export interface UserInfo {
  username: string
  role: 'admin' | 'user'
  permission: 'read' | 'write'
  rootDir: string
}

// Create user request
export interface CreateUserRequest {
  username: string
  password: string
  role: 'admin' | 'user'
  permission: 'read' | 'write'
  rootDir: string
}

// Update user request
export interface UpdateUserRequest {
  username?: string
  password?: string
  role?: 'admin' | 'user'
  permission?: 'read' | 'write'
  rootDir?: string
}

// Login request
export interface LoginRequest {
  username: string
  password: string
}

// Login response
export interface LoginResponse {
  success: boolean
  role: 'admin' | 'user'
  error?: string
}

// Auth status response
export interface AuthStatusResponse {
  loggedIn: boolean
  username?: string
  role?: 'admin' | 'user'
}

// App config
export interface AppConfig {
  name: string
  baseUrl: string
}

// Layout type
export type LayoutType = 'list' | 'grid'

// Create user response
export interface CreateUserResponse {
  success: boolean
  user: UserInfo
  error?: string
}

// Update user response
export interface UpdateUserResponse {
  success: boolean
  user: UserInfo
  error?: string
}

// Delete user response
export interface DeleteUserResponse {
  success: boolean
  error?: string
}

// Upload response
export interface UploadResponse {
  success: boolean
  files: string[]
  currentDir: string
}
