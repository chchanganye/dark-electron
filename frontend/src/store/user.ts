import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    userInfo: null as any,
    tokens: null as any,
  }),
  actions: {
    setLogin(userInfo: any, tokens: any) {
      this.isLogin = true;
      this.userInfo = userInfo;
      this.tokens = tokens;
    },
    logout() {
      this.isLogin = false;
      this.userInfo = null;
      this.tokens = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('autoLogin');
    }
  }
});
