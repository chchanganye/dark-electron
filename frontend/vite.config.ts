import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Pages from 'vite-plugin-pages'

import path from 'path'
// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    // 项目插件
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        // 自动导入Vue API和组件
        imports: [
          'vue',
          'vue-router'
        ],
        // 可以选择是否自动导入directives
        dirs: ['src/composables', 'src/utils'],
        // 声明文件生成位置
        dts: 'auto-imports.d.ts'
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'components.d.ts'
      }),
      Pages({
        dirs: 'src/views',
        extensions: ['vue','ts'],
        importMode: 'async',   // 路由懒加载
        exclude: ['**/components/**'],
      })
    ],
    // 基础配置
    base: './',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            '@border-color-base': '#dce3e8',
          },
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      brotliSize: false,
      sourcemap: false,
      minify: 'terser' as const,
      terserOptions: {
        compress: {
          // 生产环境去除console及debug
          drop_console: false,
          drop_debugger: true,
        },
      },
    },
  }
})