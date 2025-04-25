<template>
  <div id="app-updater">
    <div class="one-block-1">
      <span>
        1. 自动更新
      </span>
    </div>  
    <div class="one-block-2">
      <div class="el-space">
        <el-button @click="checkForUpdater()">检查更新</el-button>
        <el-button @click="download()">下载并安装</el-button>
      </div>
    </div>
    <div class="one-block-1">
      <span>
        2. 下载进度
      </span>
    </div>  
    <div class="one-block-2">
      <el-progress :percentage="percentNumber" :stroke-width="15" />
      <div class="el-space">
        {{ progress }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute, specialIpcRoute } from '@/api';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const status = ref(0);
const progress = ref('');
const percentNumber = ref(0);

onMounted(() => {
  init()
})

function init() {
  ipc.removeAllListeners(specialIpcRoute.appUpdater);
  ipc.on(specialIpcRoute.appUpdater, (event: any, result: any) => {
    result = JSON.parse(result);
    status.value = result.status;
    if (result.status == 3) {
      progress.value = result.desc;
      percentNumber.value = result.percentNumber;
    } else {
      ElMessage.info(result.desc);
    }
  })
}

function checkForUpdater () {
  ipc.invoke(ipcApiRoute.framework.checkForUpdater).then((res: any) => {
    console.log(res);
  })
}

function download () {
  if (status.value !== 1) {
    ElMessage.info('没有可用版本');
    return
  }
  ipc.invoke(ipcApiRoute.framework.downloadApp).then((res: any) => {
    console.log(res);
  })
}
</script>
<style lang="less" scoped>
#app-updater {
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
  