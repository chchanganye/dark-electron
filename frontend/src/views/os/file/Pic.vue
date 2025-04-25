<template>
  <div id="os-file-pic">
    <div class="one-block-1">
      <span>
          1. 加载本机图片
      </span>
    </div>  
    <div class="one-block-2">
      <div class="el-space">
          <el-button @click="selectPic()">选择图片</el-button>
      </div>
      <p></p>
      <el-image
        :width="500"
        :src="picPath"
        fit="contain"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref } from 'vue';

const picPath = ref('https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png');

function selectPic() {
  ipc.invoke(ipcApiRoute.os.selectPic).then((res: any) => { 
    picPath.value = res;
  })
}
</script>
<style lang="less" scoped>
#os-file-pic {
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
</style>
  