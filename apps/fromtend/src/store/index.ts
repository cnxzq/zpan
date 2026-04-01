
import { createPinia } from 'pinia'
import type { Plugin } from 'vue'
const pinia = createPinia()

export const piniaPlugin:Plugin = {
    install(app){
        return app.use(pinia)
    }
}