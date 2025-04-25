import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
// 导入自动生成的路由
// @ts-ignore - vite-plugin-pages生成的虚拟模块
import routes from 'virtual:generated-pages'
import AppSider from '@/layouts/AppSider.vue'

// 特殊路由配置
const specialRoutes: RouteRecordRaw[] = [
  {
    path: '/special',
    children: [
      {
        path: 'subwindow',
        name: 'SpecialSubwindowIpc',
        component: () => import('@/views/os/subwindow/Ipc.vue')
      },
      {
        path: '/login',
        name: 'SpecialLoginWindow',
        component: () => import('@/views/effect/login/Window.vue')
      },
    ]
  }
]

// 将自动路由添加到根布局中
const layoutRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppSider,
    children: routes
  },
  ...specialRoutes
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: layoutRoutes,
})

export default router
