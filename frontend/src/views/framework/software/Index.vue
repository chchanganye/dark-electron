<template>
  <div id="app-software">
    <div class="one-block-1">
      <span>
        1. 调用其它软件 (exe、bash等可执行程序)
      </span>
      <p/>
      <span class="sub-content">
        注: 请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
      </span>
    </div>  
    <div class="one-block-2">
      <div class="el-space">
        {{ soft }}
        <el-button @click="openSoft">执行</el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const soft = ref('powershell.exe');

function openSoft() { 
  ipc.invoke(ipcApiRoute.framework.openSoftware, {softName: soft.value}).then((result: any) => {
    if (!result) {
      ElMessage.error('程序不存在');
    }
  })       
}
</script>
<style lang="less" scoped>
#app-software {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    .sub-content {
      font-size: 14px;
    }
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
