import { get, post } from './client'
import type { LoginRequest, LoginResponse, AuthStatusResponse } from '../types'

export function login(data: LoginRequest): Promise<LoginResponse> {
  return post('/auth/login', data)
}

export function logout(): Promise<{success: boolean}> {
  return get('/auth/logout')
}

export function getStatus(): Promise<AuthStatusResponse> {
  return get('/auth/status')
}
