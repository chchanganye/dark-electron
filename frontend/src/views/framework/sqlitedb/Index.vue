<template>
  <div id="app-sqlite-db">
    <div class="one-block-1">
      <span>
        1. sqlite本地数据库
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="8">
          • 大数据量: 0-1024GB(单库)
        </el-col>
        <el-col :span="8">
          • 高性能
        </el-col>
        <el-col :span="8">
          • 类mysql语法
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        2. 数据目录
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="12">
          <el-input v-model="data_dir" :value="data_dir">
            <template #prefix>数据目录</template>
          </el-input>
        </el-col>
        <el-col :span="2">
        </el-col>
        <el-col :span="5">
          <el-button @click="selectDir()">
            修改目录
          </el-button>
        </el-col>
        <el-col :span="5">
          <el-button @click="openDir()">
            打开目录
          </el-button>
        </el-col>        
      </el-row>
    </div>     
    <div class="one-block-1">
      <span>
        3. 测试数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="24">
          {{ all_list }}
        </el-col>
      </el-row>
    </div>    
    <div class="one-block-1">
      <span>
        4. 添加数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="6">
          <el-input v-model="name" :value="name">
            <template #prefix>姓名</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-input v-model="age" :value="age">
            <template #prefix>年龄</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('add')">
            添加
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        4. 获取数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <el-input v-model:value="search_age">
            <template #prefix>年龄</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('get')">
            查找
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          {{ userList }}
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        5. 修改数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <el-input v-model:value="update_name">
            <template #prefix>姓名(条件)</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <el-input v-model:value="update_age">
            <template #prefix>年龄</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('update')">
            更新
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        6. 删除数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <el-input v-model:value="delete_name">
            <template #prefix>姓名</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('del')">
            删除
          </el-button>
        </el-col>
      </el-row>
    </div>       
  </div>
</template>
<script setup lang="ts">
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const name = ref('李四');
const age = ref(20);
const userList = ref(['空']);
const search_age = ref(20);
const update_name = ref('李四');
const update_age = ref(31);
const delete_name = ref('李四');
const all_list = ref(['空']);
const data_dir = ref('');

onMounted(() => {
  init()
})

function init() {
  const params = {
    action: 'getDataDir',
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then((res: any) => {
    if (res.code == -1) {
      ElMessage.error('请检查sqlite是否正确安装');
      return
    }

    data_dir.value = res.result;
    getAllTestData();
  }) 
}

function getAllTestData () {
  const params = {
    action: 'all',
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then((res: any) => {
    if (res.all_list.length == 0) {
      return false;
    }
    all_list.value = res.all_list;
  }) 
}

function selectDir() {
  ipc.invoke(ipcApiRoute.os.selectFolder, '').then((res: any) => {
    data_dir.value = res;
    // 修改数据目录
    modifyDataDir(res);
  })
}

function openDir() {
  console.log('data_dir:', data_dir.value);
  ipc.invoke(ipcApiRoute.os.openDirectory, {id: data_dir.value})
}

function modifyDataDir(dir: string) {
  const params = {
    action: 'setDataDir',
    data_dir: dir
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then((res: any) => {
    all_list.value = res.all_list;
  }) 
}

function sqlitedbOperation (ac: string) {
  const params = {
    action: ac,
    info: {
      name: name.value,
      age: age.value
    },
    search_age: search_age.value,
    update_name: update_name.value,
    update_age: update_age.value,
    delete_name: delete_name.value,
  }
  if (ac == 'add' && name.value.length == 0) {
    ElMessage.error(`请填写数据`);
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then((res: any) => {
    console.log('res:', res);
    if (ac == 'get') {
      if (res.result.length == 0) {
        ElMessage.error(`没有数据`);
        return;
      }
      userList.value = res.result;
    }
    if (res.all_list.length == 0) {
      all_list.value = ['空'];
      return;
    }
    all_list.value = res.all_list;
    ElMessage.success(`success`);
  }) 
}
</script>
<style lang="less" scoped>
#app-sqlite-db {
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
