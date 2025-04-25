<template>
  <div class="theme-switch-demo">
    <el-card class="theme-demo-card">
      <template #header>
        <div class="card-header">
          <span>主题切换演示</span>
          <ThemeSwitch />
        </div>
      </template>
      
      <div class="theme-info">
        <p>当前主题模式: <el-tag type="success">{{ themeModeName }}</el-tag></p>
        <p>暗黑模式状态: <el-tag :type="isDark ? 'info' : 'warning'">{{ isDark ? '暗色' : '亮色' }}</el-tag></p>
      </div>
      
      <div class="theme-preview">
        <h3>主题预览</h3>
        <div class="component-showcase">
          <div class="component-row">
            <el-button>默认按钮</el-button>
            <el-button type="primary">主要按钮</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="warning">警告按钮</el-button>
            <el-button type="danger">危险按钮</el-button>
          </div>
          
          <div class="component-row">
            <el-input v-model="inputValue" placeholder="请输入内容"></el-input>
          </div>
          
          <div class="component-row">
            <el-alert title="成功提示的文案" type="success" :closable="false" />
          </div>
          
          <div class="component-row">
            <el-progress :percentage="50"></el-progress>
          </div>
        </div>
      </div>
      
      <div class="theme-actions">
        <el-button type="primary" @click="setThemeMode('light')">设为亮色</el-button>
        <el-button type="info" @click="setThemeMode('dark')">设为暗色</el-button>
        <el-button @click="setThemeMode('auto')">跟随系统</el-button>
        <el-button @click="toggleMode">切换主题</el-button>
      </div>
      
      <div class="theme-help">
        <h3>主题切换工具说明</h3>
        <p>1. 本应用支持暗色模式和亮色模式</p>
        <p>2. 可以使用 <code>useDark</code> 钩子在任何组件中使用主题功能</p>
        <p>3. 主题状态会自动保存到 localStorage 中</p>
        <p>4. 也可以使用全局的 ThemeSwitch 组件快速切换主题</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { isDark, themeMode, toggleDark, setThemeMode } from '@/utils/theme'

// 演示用输入框
const inputValue = ref('这是一个示例文本')

// 获取当前主题模式的名称
const themeModeName = computed(() => {
  switch (themeMode.value) {
    case 'light': return '亮色模式'
    case 'dark': return '暗色模式'
    case 'auto': return '自动模式'
    default: return '未知模式'
  }
})

// 切换主题
const toggleMode = () => {
  toggleDark()
}
</script>

<style lang="less" scoped>
.theme-switch-demo {
  padding: 20px;
  
  .theme-demo-card {
    max-width: 800px;
    margin: 0 auto;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .theme-info {
      margin-bottom: 20px;
      text-align: left;
      
      p {
        margin: 10px 0;
      }
    }
    
    .theme-preview {
      margin-bottom: 20px;
      
      h3 {
        text-align: left;
        margin-bottom: 15px;
      }
      
      .component-showcase {
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        padding: 20px;
        background-color: var(--el-bg-color-overlay);
      }
      
      .component-row {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .theme-actions {
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .theme-help {
      text-align: left;
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
      background-color: var(--el-fill-color-light);
      
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
      }
      
      p {
        margin: 5px 0;
        line-height: 1.5;
      }
      
      code {
        background-color: var(--el-fill-color);
        border-radius: 3px;
        padding: 2px 4px;
        font-family: monospace;
      }
    }
  }
}
</style> 