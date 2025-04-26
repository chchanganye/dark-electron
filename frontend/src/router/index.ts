import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
// 导入自动生成的路由
// @ts-ignore - vite-plugin-pages生成的虚拟模块
import routes from 'virtual:generated-pages'
import AppSider from '@/layouts/AppSider.vue'
import { useUserStore } from '@/store/user'

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
  // 登录页单独顶级
  {
    path: '/effect/login/window',
    component: () => import('@/views/effect/login/Window.vue')
  },
  // 其它页面都用主布局
  {
    path: '/',
    component: AppSider,
    children: routes.filter((r: RouteRecordRaw) => r.path !== '/effect/login/window')
  },
  ...specialRoutes
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: layoutRoutes,
})

// 路由守卫：未登录强制跳转到登录页
router.beforeEach((to, from, next) => {
  if (to.path === '/effect/login/window') {
    return next();
  }
  const userStore = useUserStore();
  if (userStore.isLogin) {
    return next();
  }
  next('/effect/login/window');
});

export default router
