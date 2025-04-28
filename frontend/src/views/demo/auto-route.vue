<template>
  <div class="auto-route-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>自动路由演示</span>
          <el-tag type="success">vite-plugin-pages</el-tag>
        </div>
      </template>
      <div class="card-content">
        <el-alert
          title="自动路由工作正常！"
          type="success"
          description="这个页面位于 /views/demo/auto-route.vue 并通过 vite-plugin-pages 自动创建路由。"
          show-icon
          :closable="false"
        />

        <div class="info-section">
          <h3>当前路由信息：</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="路径">{{ route.path }}</el-descriptions-item>
            <el-descriptions-item label="名称">{{ route.name }}</el-descriptions-item>
            <el-descriptions-item label="组件路径">{{ '/views/demo/auto-route.vue' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="button-section">
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style lang="less" scoped>
.auto-route-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .demo-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }

    .card-content {
      padding: 20px 0;

      .info-section {
        margin-top: 20px;

        h3 {
          margin-bottom: 10px;
          font-size: 16px;
        }
      }

      .button-section {
        margin-top: 20px;
        text-align: center;
      }
    }
  }
}
</style>