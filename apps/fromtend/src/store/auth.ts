import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authApi from '@/api/auth'
import type { UserInfo } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  /**已登录 */
  const loggedIn = ref(false)

  /**判断权限 */
  const checkingAuth = ref(true)

  /**管理员 */
  const isAdmin = ref(false)

  /**用户信息 */
  const user = ref<UserInfo | null>(null)

  /**登录模式 */
  const showLoginModal = ref(false)

  /**登录错误信息 */
  const loginError = ref('')

  /**登录中 */
  const loggingIn = ref(false)

  async function checkAuth(): Promise<boolean> {
    checkingAuth.value = true
    try {
      const res = await authApi.getStatus()
      if (res.loggedIn && res.username && res.role) {
        loggedIn.value = true
        isAdmin.value = res.role === 'admin'
        user.value = {
          username: res.username,
          role: res.role,
          permission: 'write',
          rootDir: '',
        }
      } else {
        loggedIn.value = false
        user.value = null
        isAdmin.value = false
      }
      return loggedIn.value
    } catch (error) {
      loggedIn.value = false
      user.value = null
      isAdmin.value = false
      return false
    } finally {
      checkingAuth.value = false
    }
  }

  async function login({ username, password }: { username: string, password: string }): Promise<boolean> {
    loginError.value = ''
    loggingIn.value = true
    try {
      const res = await authApi.login({ username, password })
      if (res.success && res.role) {
        loggedIn.value = true
        isAdmin.value = res.role === 'admin'
        user.value = {
          username,
          role: res.role,
          permission: 'write',
          rootDir: '',
        }
        showLoginModal.value = false
        return true
      } else {
        loginError.value = res.error || 'Login failed'
        return false
      }
    } catch (error: any) {
      loginError.value = error.message || 'Login failed'
      return false
    } finally {
      loggingIn.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      loggedIn.value = false
      user.value = null
      isAdmin.value = false
    }
  }

  function openLoginModal(): void {
    showLoginModal.value = true
  }

  function closeLoginModal(): void {
    showLoginModal.value = false
    loginError.value = ''
  }

  return {
    loggedIn,
    checkingAuth,
    isAdmin,
    user,
    showLoginModal,
    loginError,
    loggingIn,
    checkAuth,
    login,
    logout,
    openLoginModal,
    closeLoginModal,
  }
})
