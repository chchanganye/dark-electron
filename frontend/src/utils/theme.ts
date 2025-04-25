/**
 * 主题管理工具
 */
import { ref, watch } from 'vue'
import { getThemeMode, saveThemeMode, ThemeMode, isSystemDarkTheme, watchSystemTheme } from './themeStorage'

/**
 * 使用暗黑模式hook
 * @returns isDark状态和切换函数
 */
export function useDark() {
  // 创建主题状态
  const isDark = ref(getThemeMode() === 'dark' || (getThemeMode() === 'auto' && isSystemDarkTheme()))
  const themeMode = ref<ThemeMode>(getThemeMode())
  
  console.log('初始化主题状态:', { isDark: isDark.value, mode: themeMode.value })
  
  // 立即应用主题设置
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    console.log('应用暗色主题')
  } else {
    document.documentElement.classList.remove('dark')
    console.log('应用亮色主题')
  }
  
  // 如果是auto模式，监听系统主题变化
  if (themeMode.value === 'auto') {
    watchSystemTheme(updateThemeBySystem)
    console.log('监听系统主题变化')
  }
  
  // 监听isDark变化，更新DOM
  watch(isDark, (val) => {
    console.log('主题状态变化:', val ? '暗色' : '亮色')
    if (val) {
      document.documentElement.classList.add('dark')
      console.log('添加dark类名')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('移除dark类名')
    }
  })
  
  /**
   * 更新系统主题
   */
  function updateThemeBySystem(systemDark: boolean) {
    console.log('系统主题变化:', systemDark ? '暗色' : '亮色')
    if (themeMode.value === 'auto') {
      isDark.value = systemDark
    }
  }
  
  /**
   * 切换暗黑模式
   */
  function toggleDark() {
    console.log('切换主题，当前状态:', { isDark: isDark.value, mode: themeMode.value })
    
    // 如果当前是auto模式，则切换到明确的light或dark模式
    if (themeMode.value === 'auto') {
      const newMode: ThemeMode = isSystemDarkTheme() ? 'light' : 'dark'
      themeMode.value = newMode
      isDark.value = newMode === 'dark'
      console.log('从auto模式切换到:', newMode)
    } else {
      // 在light/dark之间切换
      themeMode.value = isDark.value ? 'light' : 'dark'
      isDark.value = !isDark.value
      console.log('模式切换为:', themeMode.value)
    }
    
    // 保存到本地存储
    saveThemeMode(themeMode.value)
    console.log('保存主题状态到本地:', themeMode.value)
    
    return isDark.value
  }
  
  /**
   * 设置特定主题模式
   */
  function setThemeMode(mode: ThemeMode) {
    console.log('设置主题模式:', mode)
    themeMode.value = mode
    
    if (mode === 'dark') {
      isDark.value = true
    } else if (mode === 'light') {
      isDark.value = false
    } else if (mode === 'auto') {
      // 跟随系统
      isDark.value = isSystemDarkTheme()
      console.log('跟随系统主题:', isDark.value ? '暗色' : '亮色')
      // 监听系统主题变化
      watchSystemTheme(updateThemeBySystem)
    }
    
    // 保存到本地存储
    saveThemeMode(mode)
  }
  
  return {
    isDark, 
    toggleDark, 
    themeMode,
    setThemeMode
  }
}

// 创建并导出一个全局的useDark实例，确保整个应用使用同一个状态
export const themeState = useDark()
export const { isDark, toggleDark, themeMode, setThemeMode } = themeState 