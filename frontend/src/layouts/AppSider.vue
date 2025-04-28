<template>
  <div class="layout-container">
    <div class="layout-sider">
      <div class="logo">
        <img class="pic-logo" src="~@/assets/logo.png">
      </div>
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenuItem"
          :collapse="collapsed"
          @select="menuItemSelect"
          class="app-menu"
        >
          <el-sub-menu
            v-for="(menu, index) in sortedMainMenus"
            :key="menu.name"
            :index="menu.name"
            popper-class="dark-submenu"
          >
            <template #title>
              <el-icon>
                <component :is="menu.icon" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>

            <el-menu-item
              v-for="item in getSortedMenuItems(menu.name)"
              :key="item.path"
              :index="item.path"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </div>

    <div class="main-content">
      <TitleBar :avatar-url="userAvatarUrl" @logout="handleLogout" />
      <div class="layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  getSortedMainMenus,
  getSortedMenuItems,
  getMenuItemByPath
} from '@/router/subMenu';
import TitleBar from '@/components/TitleBar.vue';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const collapsed = ref<boolean>(false);
const activeMenuItem = ref<string>('');

// 获取排序后的主菜单
const sortedMainMenus = computed(() => getSortedMainMenus());

// 计算用户头像URL
const userAvatarUrl = computed(() => {
  // UserInfo接口中没有avatar属性，使用默认头像
  return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
});

onMounted(() => {
  // 根据当前路由设置激活菜单
  setActiveMenuItem(route.path);
});

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    setActiveMenuItem(newPath);
  }
);

// 设置激活的菜单项
function setActiveMenuItem(path: string) {
  // 设置当前活动菜单
  activeMenuItem.value = path;
}

// 菜单项选择处理
function menuItemSelect(path: string) {
  if (!path) return;

  // 如果选择的是主菜单
  if (!path.startsWith('/')) {
    // 获取该主菜单下第一个菜单项
    const menu = sortedMainMenus.value.find(m => m.name === path);
    if (!menu || !menu.children.length) return;

    const firstMenuItem = getSortedMenuItems(path)[0];
    if (!firstMenuItem) return;

    // 导航到第一个菜单项
    router.push(firstMenuItem.path);
  } else {
    // 直接导航到指定路径
    router.push(path);
  }
}

// 处理用户登出
function handleLogout() {
  userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/effect/login/window');
}
</script>
<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  overflow: hidden;
  background-color: var(--app-bg-primary);
  color: var(--app-text-primary);

  .layout-sider {
    width: var(--app-sidebar-width);
    height: 100vh;
    background: var(--app-bg-gradient);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .logo {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 30px;
      margin-bottom: 0;
      z-index: 2;
      background: transparent;
    }

    .pic-logo {
      height: 50px;
    }

    .menu-scrollbar {
      flex: 1;
      height: calc(100vh - 100px);
      overflow: hidden;
    }

    .app-menu {
      height: 100%;
      background: transparent;
      border-right: none;
      padding-top: 0;

      :deep(.el-sub-menu__title) {
        padding-left: 20px;
        margin: 0 12px 8px 12px;
        height: 38px;
        line-height: 38px;
        border-radius: 6px;

        &:hover {
          background-color: var(--el-menu-hover-bg-color);
        }
      }

      :deep(.el-menu-item) {
        padding-left: 30px !important;
        margin: 0 12px 8px 12px;
        height: 38px;
        line-height: 38px;
        border-radius: 6px;
        width: calc(100% - 24px);
        position: relative;

        &:hover {
          background-color: var(--el-menu-hover-bg-color);
        }

        &.is-active {
          background-color: var(--el-menu-hover-bg-color);
          position: relative;
        }
      }

      :deep(.el-icon) {
        margin-right: 10px;
      }

      :deep(.el-menu--inline) {
        background-color: transparent;
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .layout-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}

:deep(.dark-submenu) {
  background-color: var(--app-bg-secondary) !important;

  .el-menu-item {
    background-color: var(--app-bg-secondary);
    color: var(--app-text-secondary);
    margin: 0 12px 8px 12px;
    border-radius: 6px;
    width: calc(100% - 24px);
    padding-left: 30px !important;
    position: relative;

    &:hover {
      background-color: var(--el-menu-hover-bg-color);
      color: var(--app-text-primary);
    }

    &.is-active {
      background-color: var(--el-menu-hover-bg-color);
      color: var(--app-text-primary);
      position: relative;
    }
  }
}
</style>
