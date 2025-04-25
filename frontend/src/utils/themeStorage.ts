/**
 * 主题存储工具
 * 用于保存和获取主题状态
 */

// 主题模式类型
export type ThemeMode = 'dark' | 'light' | 'auto'

// 主题存储KEY
const THEME_KEY = 'app-theme-mode'

/**
 * 获取本地保存的主题模式
 * @returns 主题模式
 */
export function getThemeMode(): ThemeMode {
  const mode = localStorage.getItem(THEME_KEY)
  if (mode && (mode === 'dark' || mode === 'light' || mode === 'auto')) {
    return mode
  }
  return 'dark' // 默认暗色主题
}

/**
 * 保存主题模式到本地
 * @param mode 主题模式
 */
export function saveThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_KEY, mode)
}

/**
 * 检测系统默认主题
 * @returns 是否为暗色主题
 */
export function isSystemDarkTheme(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 监听系统主题变化
 * @param callback 回调函数
 */
export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches)
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  // 返回清除监听的函数
  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
} 