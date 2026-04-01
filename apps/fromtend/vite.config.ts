import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from "unplugin-auto-import/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
        resolvers: [
        ],
        imports: [
          'vue',
          'vue-router',
          // {
          //   from: "@/lib/lx-js-sdk/interface",
          //   type: true,
          //   imports: [
          //   ]
          // },
          // {
          //   from: '@/lib/vue-refresh',
          //   imports: [
          //     'onRefresh',
          //     'triggerRefresh',
          //   ]
          // },
          // {
          //   '@/hooks': [
          //     "useApp",
          //   ],
          //   '@/store': [
          //     'useHHConnectStore',
          //   ],
          // },
        ]
      }),
      Components({
        globs: [
          'src/components/**/*.vue',
          'src/components/**/*.tsx',
          'src/views/components/*.vue',
        ],
        resolvers: [
        ],
        dts: true,
      }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
      },
      '/raw': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
      },
    },
  },
})
