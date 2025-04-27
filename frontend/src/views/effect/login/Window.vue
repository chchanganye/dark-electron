<template>
  <div id="effect-login-window">
    <TitleBar onlyClose />
    <div class="login-card">
      <div class="logo-container" :style="{ marginBottom: showRegister ? '10px' : '50px' }">
        <transition name="logo-move">
          <img src="/src/assets/logo.png" alt="Logo" :class="['logo', isRegister ? 'small' : '']" />
        </transition>
      </div>
      <transition :name="isRegister ? 'fade-slide-up' : 'fade-slide-down'" mode="out-in"
        @before-enter="handleBeforeEnter" @after-enter="handleAfterEnter" @before-leave="handleBeforeLeave"
        @after-leave="handleAfterLeave">
        <div class="login-form" :key="String(isRegister)">
          <div class="input-group">
            <el-input v-model="username" :placeholder="isRegister ? '输入账号' : '输入账号'" prefix-icon="User" />
          </div>

          <div class="input-group">
            <el-input v-model="password" :placeholder="isRegister ? '设置密码' : '请输入密码'" prefix-icon="Lock"
              type="password" />
          </div>

          <div v-if="isRegister" class="input-group">
            <el-input v-model="confirmPassword" placeholder="确认密码" prefix-icon="Lock" type="password" />
          </div>

          <div v-if="isRegister" class="input-group">
            <el-input v-model="cardKey" placeholder="输入卡密" prefix-icon="Key" />
          </div>

          <div v-if="!isRegister" class="remember-container">
            <el-checkbox v-model="rememberAccount">记住账号</el-checkbox>
            <el-checkbox v-model="autoLogin" style="margin-left: 16px;">自动登录</el-checkbox>
          </div>

          <div class="login-button-container">
            <el-button type="primary" :loading="loading" class="login-button"
              @click="isRegister ? register() : login()">
              {{ loading ? (isRegister ? '正在注册...' : loginText) : (isRegister ? '注册' : '登录') }}
            </el-button>
          </div>

          <div class="register-container">
            <template v-if="!isRegister">
              <a class="register-link" @click="isRegister = true">注册账号</a>
              <span class="divider">|</span>
              <a class="register-link" @click="register">忘记密码</a>
            </template>
            <template v-else>
              <a class="register-link" @click="isRegister = false">返回登录</a>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import TitleBar from '@/components/TitleBar.vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const router = useRouter();
const loading = ref(false);
const loginText = ref('正在登录...');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const rememberAccount = ref(false);
const cardKey = ref('');
const isRegister = ref(false);
const showRegister = ref(false);
const autoLogin = ref(false);
const userStore = useUserStore();

onMounted(async () => {
  // 从 pinia 获取记住账号
  rememberAccount.value = !!userStore.rememberedAccount;
  if (userStore.rememberedAccount) {
    username.value = userStore.rememberedAccount;
  }
  // 从 pinia 获取自动登录
  autoLogin.value = userStore.autoLogin;
  // 自动登录逻辑
  if (autoLogin.value) {
    loading.value = true;
    if (!userStore.userInfo?.id || !userStore.appTokens?.access || !userStore.appTokens?.refresh) {
      console.log('自动登录取消，用户信息或令牌不完整');
      autoLogin.value = false;
      userStore.setAutoLogin(false);
      loading.value = false;
      return;
    }
    const result = await ipc.invoke(ipcApiRoute.effect.autoLogin, { 
      userId: userStore.userInfo.id, 
      accessToken: userStore.appTokens.access 
    });
    if (result?.code === 200) {
      // 保存用户信息(包含权限)、token到store
      // 权限字段会被保存在内存中，但不会被持久化到本地存储
      console.log('自动登录成功', result.data);
      userStore.setLogin(result.data.user);
      setTimeout(() => {
        router.push('/framework/socket/ipc');
        ipc.invoke(ipcApiRoute.effect.restoreWindow, { width: 980, height: 650 });
        ElMessage.success('登录成功');
      }, 1000);
    } else {
      ElMessage.error(result?.message || '自动登录失败,请手动登录');
      loading.value = false;
    }
  }
});

const login = async () => {
  loading.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.effect.login, {
      username: username.value,
      password: password.value
    });

    if (result?.code === 200) {
      // 保存用户信息(包含权限)、token到store
      // 权限字段会被保存在内存中，但不会被持久化到本地存储
      console.log('登录成功', result.data);
      userStore.setLogin(result.data.user, result.data.tokens);
      
      if (rememberAccount.value) {
        userStore.setRememberedAccount(username.value);
      } else {
        userStore.setRememberedAccount('');
      }
      
      userStore.setAutoLogin(autoLogin.value);
      
      ElMessage.success(result.message);
      setTimeout(() => {
        router.push('/framework/socket/ipc');
        ipc.invoke(ipcApiRoute.effect.restoreWindow, { width: 980, height: 650 });
      }, 1000);
    } else {
      ElMessage.error(result?.message || '登录失败');
    }
  } catch (error) {
    ElMessage.error('登录请求异常');
  } finally {
    loading.value = false;
  }
}

const register = async () => {
  //校验密码和确认密码
  if (password.value !== confirmPassword.value) {
    ElMessage.error('密码和确认密码不一致');
    return;
  }
  //校验是否为空
  if (!username.value || !password.value || !confirmPassword.value || !cardKey.value) {
    ElMessage.error('请填写完整信息');
    return;
  }
  loading.value = true;
  try {
    const params = {
      username: username.value,
      nickname: username.value, // 如有独立昵称输入框请替换
      password: password.value,
      card_key: cardKey.value
    };
    const result = await ipc.invoke(ipcApiRoute.effect.register, params);
    if (result?.success) {
      isRegister.value = false;
      // 可添加注册成功提示
      ElMessage.success('注册成功,返回登录');
    } else {
      ElMessage.error(result?.message);
    }
  } finally {
    loading.value = false;
  }
}

function handleBeforeEnter() {
  showRegister.value = isRegister.value;
}

function handleAfterEnter() {
  showRegister.value = isRegister.value;
}

function handleBeforeLeave() {
  // 保持 showRegister 不变，直到动画结束
}

function handleAfterLeave() {
  showRegister.value = isRegister.value;
}

watch(rememberAccount, (val) => {
  if (val) {
    userStore.setRememberedAccount(username.value);
  } else {
    userStore.setRememberedAccount('');
  }
});

watch(username, (val) => {
  if (rememberAccount.value) {
    userStore.setRememberedAccount(val);
  }
});

watch(autoLogin, (val) => {
  userStore.setAutoLogin(val);
});
</script>

<style lang="scss" scoped>
#effect-login-window {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #2B2A33 0%, #2b2a33 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.login-card {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 30px;
  position: relative;
  top: -30px;
  z-index: 2;
  padding-top: 30px;

  &::before {
    display: none;
  }
}

.logo-container {
  z-index: 2;
  transition: margin-bottom 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);

  .logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 50%;
    background-color: #4a87ff;
    padding: 5px;
    transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.small {
      width: 60px;
      height: 60px;
      transform: translateY(-15px);
    }
  }
}

.logo-move-enter-active,
.logo-move-leave-active {
  transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-move-enter-from,
.logo-move-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.login-form {
  width: calc(100% - 10px);
  max-width: 310px;
  z-index: 2;
  margin-top: -10px;

  .input-group {
    margin-bottom: 16px;

    .el-input {
      --el-input-bg-color: rgba(255, 255, 255, 0.05);
      --el-input-border-color: var(--el-border-color-light);
      --el-input-hover-border-color: var(--app-accent-color);
      --el-input-focus-border-color: var(--el-color-primary);
      border-radius: 6px;

      :deep(.el-input__inner) {
        color: var(--el-text-color-primary);
        height: 42px;
      }

      :deep(.el-input__prefix-inner i) {
        color: var(--el-text-color-secondary);
      }
    }
  }

  .remember-container {
    margin-bottom: 20px;
    margin-top: -10px;

    .el-checkbox {
      --el-checkbox-checked-bg-color: var(--el-color-primary);
      --el-checkbox-checked-text-color: #fff;
      --el-checkbox-border-color: var(--el-border-color);
      --el-checkbox-input-border: 1px solid var(--el-checkbox-border-color);

      :deep(.el-checkbox__label) {
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  .login-button-container {
    margin-bottom: 16px;

    .login-button {
      width: 100%;
      padding: 12px 0;
      font-size: 16px;
      border-radius: 4px;
      background: var(--app-accent-color);
      border: none;

      &:hover {
        background: var(--app-hover-color);
      }
    }
  }

  .register-container {
    margin-top: 20px;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;

    .register-link {
      color: var(--el-text-color-regular);
      cursor: pointer;
      text-decoration: none;

      &:hover {
        color: var(--el-color-primary);
        text-decoration: underline;
      }
    }

    .divider {
      margin: 0 8px;
      color: var(--el-text-color-disabled);
    }
  }
}

.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.3s cubic-bezier(.25, 0, .1, 1);
}

.fade-slide-down-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}


.fade-slide-down-leave-from,
.fade-slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.24s cubic-bezier(.25, 0, .1, 1);
}

.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

.fade-slide-up-leave-from,
.fade-slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
