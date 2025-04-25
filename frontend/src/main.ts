import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.scss';

// 引入主题变量
import './assets/theme.scss';

// 导入Element Plus暗黑模式CSS（确保在我们自定义主题后引入，避免覆盖）
import 'element-plus/theme-chalk/dark/css-vars.css';
import components from './components/global';
import Router from './router/index';

// 导入所有Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 导入并初始化主题状态
import './utils/theme';

const app = createApp(App)

// 注册全局组件
type ComponentsType = typeof components;
for (const componentName in components) {
  if (Object.prototype.hasOwnProperty.call(components, componentName)) {
    const component = components[componentName as keyof ComponentsType];
    app.component(componentName, component);
  }
}

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(Router).mount('#app')
