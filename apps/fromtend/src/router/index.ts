import type { Plugin } from 'vue'
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/Login.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout/Layout.vue'),
    children:[
        {
            path:'/',
            redirect:"/home",
        },
        {
            path:'/home',
            name:'home',
            component: () => import('@/views/home/Home.vue')
        },
        {
            path:'/about',
            name:'about',
            component: () => import('@/views/about/About.vue')
        }
    ]
  },
]

export const router = createRouter({
    history:createWebHashHistory(),
    routes,
})

export const routerPlugin:Plugin = {
    install(app){
        return app.use(router)
    }
}
