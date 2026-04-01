import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['esm'],
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
  esbuildOptions: (buildOptions, context) => {
    buildOptions.alias = {
      '@': './src',
      '@/utils': './src/utils',
      '@/components': './src/components'
    }
  }
})
