import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { routerPlugin } from './router'
import 'virtual:uno.css'
import { piniaPlugin } from './store'


import '@/permission' // 引入权限守卫

createApp(App)
.use(piniaPlugin)
.use(routerPlugin)
.mount('#app')
