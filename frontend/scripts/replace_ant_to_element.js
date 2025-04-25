const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 替换文件中的Ant Design组件为Element Plus组件
function replaceComponentsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换导入
  content = content.replace(/import\s*{\s*message\s*}\s*from\s*['"]ant-design-vue['"]/g, 
                          "import { ElMessage } from 'element-plus'");
  
  // 替换message调用
  content = content.replace(/message\.(\w+)\((.*?)\)/g, 'ElMessage.$1($2)');
  
  // 替换基础组件
  content = content.replace(/<a-button/g, '<el-button');
  content = content.replace(/<\/a-button>/g, '</el-button>');
  
  // 替换a-space为div，用flex布局实现类似功能
  content = content.replace(/<a-space>/g, '<div class="el-space">');
  content = content.replace(/<\/a-space>/g, '</div>');
  
  // 替换a-card组件
  content = content.replace(/<a-card/g, '<el-card');
  content = content.replace(/<\/a-card>/g, '</el-card>');
  
  // 替换a-list相关组件
  content = content.replace(/<a-list/g, '<el-scrollbar');
  content = content.replace(/<\/a-list>/g, '</el-scrollbar>');
  content = content.replace(/<a-list-item/g, '<div class="el-list-item"');
  content = content.replace(/<\/a-list-item>/g, '</div>');
  content = content.replace(/<el-scrollbar-item/g, '<div class="el-list-item"');
  
  // 替换a-image组件
  content = content.replace(/<a-image/g, '<el-image');
  content = content.replace(/<\/a-image>/g, '</el-image>');
  
  // 替换栅格相关组件
  content = content.replace(/<a-row/g, '<el-row');
  content = content.replace(/<\/a-row>/g, '</el-row>');
  content = content.replace(/<a-col/g, '<el-col');
  content = content.replace(/<\/a-col>/g, '</el-col>');
  
  // 替换a-progress组件
  content = content.replace(/<a-progress\s+:percent="([^"]+)"([^>]*)>/g, 
                          '<el-progress :percentage="$1" :stroke-width="15"$2>');
  content = content.replace(/<a-progress/g, '<el-progress');
  content = content.replace(/<\/a-progress>/g, '</el-progress>');
  content = content.replace(/status="active"/g, ''); // 移除active状态，Element Plus默认是活动的
  content = content.replace(/status="normal"/g, ''); // Element Plus没有normal状态
  
  // 替换a-input组件
  content = content.replace(/<a-input\s+v-model="([^"]+)"\s+[^>]*addon-before="([^"]+)"[^>]*>/g, 
                          '<el-input v-model="$1">\n      <template #prepend>$2</template>\n    </el-input>');
  content = content.replace(/<a-input/g, '<el-input');
  content = content.replace(/<\/a-input>/g, '</el-input>');
  
  // 添加el-space和el-list-item样式，如果没有style标签则添加
  if (content.includes('<style') && (!content.includes('.el-space') || !content.includes('.el-list-item'))) {
    const styleRegex = /(<style.*?>)([\s\S]*?)(<\/style>)/;
    const styleMatch = content.match(styleRegex);
    
    if (styleMatch) {
      const newStyles = `
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
}`;
      content = content.replace(styleRegex, `$1$2${newStyles}$3`);
    }
  }
  
  // 保存修改后的文件
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

// 查找所有Vue文件
const files = glob.sync('src/views/**/*.vue', { cwd: path.resolve(__dirname, '..') });

// 处理每个文件
files.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  replaceComponentsInFile(filePath);
});

console.log('Conversion completed!'); 