import { get, post, put, del } from './client'
import type { UserInfo, CreateUserRequest, UpdateUserRequest } from '../types'

export function getUsers(): Promise<UserInfo[]> {
  return get('/admin/users')
}

export function getUser(username: string): Promise<UserInfo> {
  return get(`/admin/users/${username}`)
}

export function createUser(data: CreateUserRequest): Promise<{success: boolean; user: UserInfo; error?: string}> {
  return post('/admin/users', data)
}

export function updateUser(username: string, data: UpdateUserRequest): Promise<{success: boolean; user: UserInfo; error?: string}> {
  return put(`/admin/users/${username}`, data)
}

export function deleteUser(username: string): Promise<{success: boolean; error?: string}> {
  return del(`/admin/users/${username}`)
}
