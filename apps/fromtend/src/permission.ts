// src/router/permission.ts
import { router } from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/store/auth'

// 进度条配置
NProgress.configure({ showSpinner: false })

// 白名单（无需登录）
const whiteList = ['/login', '/404', '/register']

// 全局前置守卫
router.beforeEach(async (to, _from) => {
    NProgress.start()

    // 获取Pinia用户仓库
    const userStore = useAuthStore()

    // 已登录
    if (userStore.loggedIn) {
        if (to.path === '/login') {
            // 已登录访问登录页 → 跳首页
            NProgress.done()
            return '/'
        } else {
            // 有token但没有用户信息 → 获取用户信息
            if (!userStore.user) {
                try {
                    // 拉取用户信息（含角色）
                    await userStore.checkAuth()
                    return true;
                } catch (err) {
                    // 获取失败 → 登出 → 跳登录
                    await userStore.logout()
                    NProgress.done()
                    return `/login?redirect=${to.path}`
                }
            } else {
                // 已有用户信息 → 直接放行
                NProgress.done()
                return true;
            }
        }
    } else {
        // 未登录
        if (whiteList.includes(to.path)) {
            // 白名单 → 放行
            NProgress.done()
            return true;
        } else {
            if(!await userStore.checkAuth()){
                // 无权访问 → 跳登录，携带来源地址
                NProgress.done()
                return {
                    path: `/login`,
                    query: {
                        redirect: encodeURIComponent(to.path)
                    }
                }
            }else{
                NProgress.done()
            }
        }
    }
})

// 全局后置守卫
router.afterEach(() => {
    NProgress.done()
})