import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// 页面 - 用户管理（异步加载 - 路由组件）
const UserManagementPage = () => import('@/views/user-management-page')

// 组件 - 文件浏览器（异步加载 - 路由组件）
const FileBrowser = () => import('@/views/file-browser')

// 创建路由
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/users',
            component: UserManagementPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/:dir*',
            component: FileBrowser,
            meta: { requiresAuth: true },
        },
    ],
});

// 添加路由守卫检查认证状态
router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.loggedIn && !authStore.checkingAuth) {
        authStore.openLoginModal();
        return false;
    }
});