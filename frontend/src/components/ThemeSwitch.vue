<template>
  <div class="theme-switch">
    <el-dropdown @command="handleCommand">
      <div class="theme-toggle">
        <el-icon v-if="isDark" class="icon-theme"><Sunny /></el-icon>
        <el-icon v-else class="icon-theme"><Moon /></el-icon>
        <span class="theme-text">{{ themeText }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="light" :class="{ active: themeMode === 'light' }">
            <div class="theme-item">
              <el-icon><Moon /></el-icon>
              <span>亮色模式</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="dark" :class="{ active: themeMode === 'dark' }">
            <div class="theme-item">
              <el-icon><Sunny /></el-icon>
              <span>暗色模式</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="auto" :class="{ active: themeMode === 'auto' }">
            <div class="theme-item">
              <el-icon><Connection /></el-icon>
              <span>跟随系统</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isDark, themeMode, setThemeMode } from '@/utils/theme'
import type { ThemeMode } from '@/utils/themeStorage'

// 处理切换命令
const handleCommand = (command: ThemeMode) => {
  setThemeMode(command)
}

// 当前主题文本
const themeText = computed(() => {
  switch (themeMode.value) {
    case 'light':
      return '亮色模式'
    case 'dark':
      return '暗色模式'
    case 'auto':
      return '跟随系统'
    default:
      return '主题设置'
  }
})
</script>

<style lang="scss" scoped>
.theme-switch {
  display: inline-block;
  
  .theme-toggle {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--el-text-color-primary);
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    
    .icon-theme {
      font-size: 18px;
      margin-right: 5px;
    }
    
    .theme-text {
      font-size: 14px;
    }
  }
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
  
  .el-icon {
    font-size: 16px;
  }
}

:deep(.el-dropdown-menu__item.active) {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}
</style> 