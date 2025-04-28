<template>
  <el-popover
    v-model:visible="popoverVisible"
    trigger="click"
    :width="200"
    placement="bottom"
    popper-class="user-profile-popover"
  >
    <template #reference>
      <slot></slot>
    </template>

    <div class="user-profile-content">
      <div class="user-profile-header">
        <div class="user-avatar">
          <el-avatar :size="40" :src="avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
        </div>
        <div class="user-info">
          <div class="user-nickname">
            <span>{{ userStore.userInfo?.nickname || '未登录' }}</span>
            <el-tooltip content="这是昵称，仅用于展示，不是用户名" placement="bottom">
              <el-button type="primary" text size="small" class="edit-btn" @click="handleEditNickname">
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          <div class="user-email">
            <template v-if="userStore.userInfo && (userStore.userInfo as any).email">
              <el-icon style="margin-right:2px;"><Message /></el-icon>{{ (userStore.userInfo as any).email }}
            </template>
            <template v-else>
              <el-button type="primary" text size="small" @click="showEmailDialog = true">
                <el-icon style="margin-right:2px;"><Message /></el-icon>设置安全邮箱
              </el-button>
            </template>
          </div>
        </div>
      </div>

      <div class="user-profile-body">
        <div class="info-item">
          <span class="label"><el-icon style="margin-right:2px;"><Wallet /></el-icon>余额</span>
          <span class="value">{{ userStore.userInfo?.balance || 0 }}元</span>
        </div>
        <div class="info-item">
          <span class="label"><el-icon style="margin-right:2px;"><Calendar /></el-icon>到期时间</span>
          <span class="value">{{ formatDate(userStore.userInfo?.card_expire) }}</span>
        </div>
      </div>

      <div class="user-profile-footer">
        <div class="menu-item" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
      </div>
    </div>
  </el-popover>

  <el-dialog
    v-model="nicknameDialogVisible"
    title="修改昵称"
    width="300px"
    destroy-on-close
    append-to-body
  >
    <el-input v-model="newNickname" placeholder="请输入新昵称"></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="nicknameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateNickname">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
    v-model="showEmailDialog"
    title="设置安全邮箱"
    width="340px"
    destroy-on-close
    append-to-body
    class="email-dialog"
    center
  >
    <el-form label-width="70px" style="margin-top:10px;">
      <el-form-item label="邮箱">
        <el-input v-model="emailInput" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="验证码">
        <el-input v-model="emailCode" placeholder="请输入验证码" style="width: 140px; margin-right: 8px;"></el-input>
        <el-button type="primary" size="small">发送验证码</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary">确认绑定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, watch } from 'vue';
import { useUserStore } from '@/store/user';
import { ElMessage, resultProps } from 'element-plus';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { Wallet, Calendar, Message } from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  avatarUrl: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'logout']);

const userStore = useUserStore();
const nicknameDialogVisible = ref(false);
const newNickname = ref('');
const popoverVisible = ref(false);
const showEmailDialog = ref(false);
const emailInput = ref('');
const emailCode = ref('');

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  popoverVisible.value = newVal;
});

// 监听内部popoverVisible变化
watch(popoverVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 处理昵称编辑
function handleEditNickname() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    return;
  }

  newNickname.value = userStore.userInfo?.nickname || '';
  nicknameDialogVisible.value = true;
}

// 保存昵称
async function updateNickname() {
  const result = await ipc.invoke(ipcApiRoute.userInfo.updateNickname, {
    userId: userStore.userInfo?.id,
    nickname: newNickname.value,
    token: userStore.appTokens?.access
  });
  if(result?.code === 200) {
    ElMessage.success(result.message);
    userStore.userInfo!.nickname = result.data.nickname;
    nicknameDialogVisible.value = false;
  } else {
    ElMessage.error(result?.message);
  }
}

// 处理退出登录
function handleLogout() {
  userStore.logout();
  emit('logout');
  popoverVisible.value = false;
  ElMessage.success('已退出登录');
}

// 格式化日期为xxxx-xx-xx
function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  // 兼容ISO格式和yyyy-MM-dd
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.split('T')[0] || dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
</script>

<style lang="scss" scoped>
:deep(.user-profile-popover) {
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.user-profile-content {
  .user-profile-header {
    padding: 8px 10px 4px 10px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .user-avatar {
      margin-right: 6px;
    }

    .user-info {
      flex: 1;

      .user-nickname {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 1px;

        .edit-btn {
          margin-left: 2px;
          padding: 0;
        }
      }

      .user-email {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        line-height: 1.2;
        margin-top: 2px;
        .el-button {
          padding: 0 4px;
          font-size: 12px;
        }
        .el-icon {
          font-size: 14px;
          vertical-align: middle;
        }
      }
    }
  }

  .user-profile-body {
    padding: 6px 10px 2px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      .label {
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
      .value {
        font-size: 12px;
        color: var(--el-text-color-primary);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .user-profile-footer {
    padding: 6px 10px 6px 10px;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 4px 0;
      cursor: pointer;
      color: var(--el-text-color-regular);
      font-size: 13px;

      &:hover {
        color: var(--el-color-danger);
      }

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

.email-dialog :deep(.dialog-footer) {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
