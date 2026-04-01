import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const client: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Response interceptor
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default client

export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return client.get(url, config).then(res => res.data)
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return client.post(url, data, config).then(res => res.data)
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return client.put(url, data, config).then(res => res.data)
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return client.delete(url, config).then(res => res.data)
}
