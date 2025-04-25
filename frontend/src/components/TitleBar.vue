<template>
  <div 
    class="custom-title-bar"
    @mousedown="startDrag"
  >
    <div class="title-spacer"></div>
    <div class="title-right">
      <div class="user-avatar">
        <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      </div>
      <div class="divider"></div>
      <div class="theme-toggle" @click="() => toggleDarkMode()">
        <el-icon v-if="isDark" class="icon-theme"><Sunny /></el-icon>
        <el-icon v-else class="icon-theme"><Moon /></el-icon>
      </div>
      <div class="window-control-button minimize" @click="minimize">
        <el-icon><Minus /></el-icon>
      </div>
      <div class="window-control-button maximize" @click="maximize">
        <el-icon v-if="isMaximized"><Crop /></el-icon>
        <el-icon v-else><FullScreen /></el-icon>
      </div>
      <div class="window-control-button close" @click="close">
        <el-icon><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { isDark, toggleDark } from '@/utils/theme';

const isMaximized = ref(false);
const isDown = ref(false);
const baseX = ref(0);
const baseY = ref(0);

// 切换暗黑模式
function toggleDarkMode() {
  toggleDark();
}

// 最小化窗口
function minimize() {
  ipc.invoke(ipcApiRoute.os.windowMinimize);
}

// 最大化/还原窗口
function maximize() {
  ipc.invoke(ipcApiRoute.os.windowMaximize).then(() => {
    isMaximized.value = !isMaximized.value;
  });
}

// 关闭窗口
function close() {
  ipc.invoke(ipcApiRoute.os.windowClose);
}

// 开始拖动
function startDrag(e: MouseEvent) {
  // 如果点击的是控制按钮，不进行拖动
  if ((e.target as HTMLElement).closest('.window-control-button') || 
      (e.target as HTMLElement).closest('.user-avatar') ||
      (e.target as HTMLElement).closest('.theme-toggle')) {
    return;
  }
  
  // 如果窗口已最大化，则不允许拖动
  if (isMaximized.value) {
    return;
  }
  
  isDown.value = true;
  baseX.value = e.x;
  baseY.value = e.y;
  
  // 添加全局鼠标事件监听
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', stopDrag);
}

// 拖动中
function onMouseMove(e: MouseEvent) {
  if (!isDown.value) return;
  
  const x = e.screenX - baseX.value;
  const y = e.screenY - baseY.value;
  
  // 通过IPC调用主进程移动窗口
  ipc.invoke(ipcApiRoute.os.windowMove, { posX: x, posY: y });
}

// 停止拖动
function stopDrag() {
  isDown.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', stopDrag);
}

// 在组件加载后检查窗口是否最大化
onMounted(() => {
  // 初始化窗口状态
  ipc.invoke(ipcApiRoute.os.isWindowMaximized).then((result: boolean) => {
    isMaximized.value = result;
  }).catch(() => {
    // 如果API不存在，忽略错误
  });
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style lang="scss" scoped>
.custom-title-bar {
  height: var(--app-header-height);
  background-color: var(--app-bg-primary);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  user-select: none;
  position: relative;
  z-index: 9999;
  cursor: default;
  padding: 0 10px;
  color: var(--app-text-primary);

  .title-spacer {
    flex: 1;
  }

  .title-right {
    display: flex;
    align-items: center;
    
    .user-avatar {
      margin-right: 15px;
      cursor: pointer;
    }
    
    .divider {
      width: 1px;
      height: 22px;
      background-color: var(--app-border-color);
      margin-right: 15px;
    }
    
    .theme-toggle {
      width: 40px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: var(--el-text-color-primary);
      margin-right: 8px;
      
      &:hover {
        background-color: var(--el-fill-color-light);
        border-radius: 4px;
      }
      
      .icon-theme {
        font-size: 18px;
      }
    }
    
    .window-control-button {
      width: 40px;
      height: var(--app-header-height);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      &.close:hover {
        background-color: #f56c6c;
      }
    }
  }
}
</style> 