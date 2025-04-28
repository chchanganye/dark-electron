// 菜单配置文件 - 支持自动路由
import { isDev } from 'ee-core/ps';

// 菜单项接口
export interface MenuItem {
  icon: string;          // Element Plus 图标名
  title: string;         // 显示标题
  path: string;          // 路由路径 (自动路由对应的路径)
  order?: number;        // 排序 (可选)
  params?: Record<string, any>; // 路由参数 (可选)
}

// 主菜单结构
export interface MainMenu {
  title: string;         // 主菜单标题
  icon: string;          // 主菜单图标
  name: string;          // 对应路由name (自动根据文件夹结构生成)
  order: number;         // 排序
  visible?: boolean;     // 是否显示菜单
  children: MenuItem[]; // 子菜单项
}

// 获取开发环境状态
const isDevMode = isDev();

// 菜单配置
export const menuConfig: MainMenu[] = [
  {
    title: '框架',
    icon: 'Grid',
    name: 'framework',
    order: 1,
    visible: isDevMode, // 仅在开发环境显示
    children: [
      {
        icon: 'ChatDotRound',
        title: 'IPC通信',
        path: '/framework/socket/ipc',
        order: 1
      },
      {
        icon: 'Service',
        title: 'HTTP服务',
        path: '/framework/socket/httpserver',
        order: 2
      },
      {
        icon: 'Link',
        title: 'Socket服务',
        path: '/framework/socket/socketserver',
        order: 3
      },
      {
        icon: 'Files',
        title: 'SQLite数据库',
        path: '/framework/sqlitedb',
        order: 4
      },
      {
        icon: 'AlarmClock',
        title: '任务',
        path: '/framework/jobs',
        order: 5
      },
      {
        icon: 'Cpu',
        title: '软件调用',
        path: '/framework/software',
        order: 6
      },
      {
        icon: 'Upload',
        title: '自动更新',
        path: '/framework/updater',
        order: 7
      }
    ]
  },
  {
    title: '系统',
    icon: 'Monitor',
    name: 'os',
    order: 2,
    visible: isDevMode, // 仅在开发环境显示
    children: [
      {
        icon: 'Document',
        title: '文件',
        path: '/os/file',
        order: 1
      },
      {
        icon: 'Picture',
        title: '图片',
        path: '/os/file/pic',
        order: 2
      },
      {
        icon: 'Monitor',
        title: '窗口',
        path: '/os/window',
        order: 3
      },
      {
        icon: 'MessageBox',
        title: '桌面通知',
        path: '/os/notification',
        order: 4
      }
    ]
  },
  {
    title: '特效',
    icon: 'MagicStick',
    name: 'effect',
    order: 3,
    visible: isDevMode, // 仅在开发环境显示
    children: [
      {
        icon: 'User',
        title: '登录',
        path: '/effect/login',
        order: 1
      }
    ]
  },
  {
    title: '跨平台',
    icon: 'Connection',
    name: 'cross',
    order: 4,
    visible: isDevMode, // 仅在开发环境显示
    children: [
      {
        icon: 'Promotion',
        title: 'Go服务',
        path: '/cross/go',
        order: 1
      },
      {
        icon: 'Coffee',
        title: 'Java服务',
        path: '/cross/java',
        order: 2
      },
      {
        icon: 'Share',
        title: 'Python服务',
        path: '/cross/python',
        order: 3
      }
    ]
  },
  {
    title: '示例',
    icon: 'Compass',
    name: 'demo',
    order: 5,
    visible: isDevMode, // 仅在开发环境显示
    children: [
      {
        icon: 'Flag',
        title: '自动路由',
        path: '/demo/auto-route',
        order: 1
      },
      {
        icon: 'Moon',
        title: '主题切换',
        path: '/demo/theme-switch',
        order: 2
      }
    ]
  },
  {
    title: '用户筛选',
    icon: 'User',
    name: 'user',
    order: 6,
    visible: true,
    children: [
      {
        icon: 'Flag',
        title: '关键词筛选',
        path: '/userfilter/keyword',
        order: 1
      },
    ]
  }

];

// 辅助函数：根据路由路径获取菜单项
export function getMenuItemByPath(path: string): MenuItem | null {
  for (const mainMenu of menuConfig) {
    for (const item of mainMenu.children) {
      if (item.path === path) {
        return item;
      }
    }
  }
  return null;
}

// 辅助函数：获取排序后的主菜单
export function getSortedMainMenus(): MainMenu[] {
  return [...menuConfig]
    .filter(menu => menu.visible !== false) // 过滤不显示的菜单
    .sort((a, b) => a.order - b.order);
}

// 辅助函数：获取排序后的菜单项
export function getSortedMenuItems(mainMenuName: string): MenuItem[] {
  const mainMenu = menuConfig.find(menu => menu.name === mainMenuName);
  if (!mainMenu || mainMenu.visible === false) return [];

  return [...mainMenu.children].sort((a, b) => (a.order || 0) - (b.order || 0));
}