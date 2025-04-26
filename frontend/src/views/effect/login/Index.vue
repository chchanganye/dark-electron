<template>
  <div id="effect-login-index">
    <div class="one-block-1">
      <span>
          1. 登录
      </span>
    </div>
    <div class="one-block-2">
      <div class="el-space">
        <el-button @click="loginWindow()">切换为登录窗口</el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { useRouter } from 'vue-router';

const router = useRouter();

function loginWindow() {
  router.push({ name: 'SpecialLoginWindow'});
  ipc.invoke(ipcApiRoute.effect.loginWindow, {width: 320, height: 440});
}
</script>
<style lang="less" scoped>
#effect-login-index {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
      font-size: 16px;
      padding-top: 10px;
  }
  .one-block-2 {
      padding-top: 10px;
  }
}

.el-space {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}
.el-space {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}
.el-list-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}</style>
