import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  balance: number;
  card_expire: string;
  permissions?: string[]; // 权限ID列表
  permission_names?: string[]; // 权限名称列表
}

interface Tokens {
  refresh: string;
  access: string;
}

/**
 * 用户状态管理
 * 使用组合式 API 风格实现
 * 包含登录状态、用户信息、令牌、记住账号和自动登录功能
 * 注意：isLogin 不持久化，登录状态应由 token 校验动态决定
 */
export const useUserStore = defineStore('user', () => {
  // 状态定义
  const isLogin = ref(false); // 不持久化
  const userInfo = ref<UserInfo | null>(null);
  const appTokens = ref<Tokens | null>(null);
  const rememberedAccount = ref('');
  const autoLogin = ref(false);

  // 计算属性
  const isAuthenticated = computed(() => isLogin.value);
  const currentUser = computed(() => userInfo.value);
  const currentTokens = computed(() => appTokens.value);

  // 方法定义
  /**
   * 设置登录状态
   * @param user - 用户信息
   * @param token - 令牌信息
   */
  function setLogin(user: UserInfo, tokens?: Tokens) {
    isLogin.value = true;
    userInfo.value = user;
    if (tokens) {
      appTokens.value = tokens;
    }
  }

  /**
   * 设置记住的账号
   * @param account - 要记住的账号
   */
  function setRememberedAccount(account: string) {
    rememberedAccount.value = account;
  }

  /**
   * 设置自动登录状态
   * @param value - 是否自动登录
   */
  function setAutoLogin(value: boolean) {
    autoLogin.value = value;
  }

  /**
   * 退出登录
   * 清除登录状态和用户信息，但保留记住的账号
   */
  function logout() {
    isLogin.value = false;
    userInfo.value = null;
    appTokens.value = null;
    autoLogin.value = false;
  }

  /**
   * 检查用户是否拥有指定权限
   * @param permission - 权限名称或ID
   * @returns 是否拥有权限
   */
  function hasPermission(permission: string): boolean {
    if (!isLogin.value || !userInfo.value) return false;

    // 先检查权限ID
    if (userInfo.value.permissions?.includes(permission)) {
      return true;
    }

    // 再检查权限名称
    if (userInfo.value.permission_names?.includes(permission)) {
      return true;
    }

    return false;
  }

  return {
    // 状态
    isLogin,
    userInfo,
    appTokens,
    rememberedAccount,
    autoLogin,

    // 计算属性
    isAuthenticated,
    currentUser,
    currentTokens,

    // 方法
    setLogin,
    setRememberedAccount,
    setAutoLogin,
    logout,
    hasPermission
  }
}, {
  // 持久化配置，只持久化必要字段
  persist: {
    debug: true,
    key: 'doyinmaster-user-store',
    storage: localStorage,
    pick: ['userInfo', 'appTokens', 'rememberedAccount', 'autoLogin', 'nickname'],
    omit: ['isLogin', 'userInfo.permissions', 'userInfo.permission_names']
  }
});
