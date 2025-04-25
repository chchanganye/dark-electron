<template>
  <div class="app-menu">
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MenuItem, getSortedMenuItems } from '@/router/subMenu';

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const route = useRoute();
const currentMenuItem = ref<MenuItem | null>(null);

watch(() => props.id, (newValue: string) => {
  console.log('watch menu id ', newValue);
  menuHandle();
});

onMounted(() => {
  menuHandle();
});

function menuHandle() {
  console.log('handle menu id:', props.id);
  
  // 获取当前菜单ID对应的菜单项
  const menuItems = getSortedMenuItems(props.id);
  
  if (menuItems && menuItems.length > 0) {
    currentMenuItem.value = menuItems[0];
    // 导航到菜单的第一个项
    router.push(currentMenuItem.value.path);
  }
}
</script>
<style lang="scss" scoped>
.app-menu {
  height: 100%;
  width: 100%;
  padding: 20px;
  background-color: var(--app-bg-primary);
  color: var(--app-text-primary);
}
</style>
