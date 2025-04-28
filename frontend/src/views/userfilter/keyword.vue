<template>
  <div class="user-filter-container" v-loading.fullscreen.lock="pageLoading" element-loading-text="页面加载中...">
    <!-- 爬取数据方式选择卡片 -->
    <el-card class="box-card mb-15">
      <template #header>
        <div class="crawl-method-header">
          <el-icon style="margin-right:6px;"><Guide /></el-icon>
          <span>选择爬取数据方式</span>
          <el-tooltip content="点击或悬停每个方式可查看详细对比说明" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-radio-group v-model="crawlMethod" class="crawl-method-radio" size="large">
        <el-popover
          placement="bottom"
          trigger="hover"
          width="260"
          effect="dark"
          popper-class="dark-popover"
        >
          <template #reference>
            <el-radio-button label="browser">浏览器自动化爬取</el-radio-button>
          </template>
          <div class="popover-title">浏览器自动化爬取</div>
          <div class="popover-tip">无需配置，兼容性好，<span class='highlight'>最稳定</span>，但速度较慢。</div>
          <div class="popover-score">
            <div class="popover-score-row"><span class="popover-score-row-label">稳定</span><el-rate :model-value="4" disabled show-score score-template="{value}/5" /></div>
            <div class="popover-score-row"><span class="popover-score-row-label">速度</span><el-rate :model-value="2" disabled show-score score-template="{value}/5" /></div>
            <div class="popover-score-row"><span class="popover-score-row-label">价格</span><span class="free">免费</span></div>
          </div>
        </el-popover>
        <el-popover
          placement="bottom"
          trigger="hover"
          width="260"
          effect="dark"
          popper-class="dark-popover"
        >
          <template #reference>
            <el-radio-button label="api">API请求爬取（需自备Cookie）</el-radio-button>
          </template>
          <div class="popover-title">API请求爬取</div>
          <div class="popover-tip">需自备Cookie，<span class='highlight'>速度快</span>，但稳定依赖Cookie，易失效。</div>
          <div class="popover-score">
            <div class="popover-score-row"><span class="popover-score-row-label">稳定</span><el-rate :model-value="2" disabled show-score score-template="{value}/5" /></div>
            <div class="popover-score-row"><span class="popover-score-row-label">速度</span><el-rate :model-value="4" disabled show-score score-template="{value}/5" /></div>
            <div class="popover-score-row"><span class="popover-score-row-label">价格</span><span class="free">免费</span></div>
          </div>
        </el-popover>
        <el-popover
          placement="bottom"
          trigger="hover"
          width="300"
          effect="dark"
          popper-class="dark-popover"
        >
          <template #reference>
            <el-radio-button label="proapi">高级API爬取（付费）</el-radio-button>
          </template>
          <div class="popover-title">高级API爬取</div>
          <div class="popover-tip">
            <span class='highlight'>速度最快</span>，<span class='highlight'>稳定最高</span>，适合高要求用户。<br>
            <span class="proapi-desc">
              该高级API由平台服务器统一维护抖音Cookie，无需担心因频繁爬取导致账号被风控，也不用自己购买抖音Cookie账号。<br>
              性价比高，适合有大量数据需求的用户。
            </span>
          </div>
          <div class="popover-score">
            <div class="popover-score-row"><span class="popover-score-row-label">稳定</span><el-rate :model-value="5" disabled show-score score-template="{value}/5" /></div>
            <div class="popover-score-row"><span class="popover-score-row-label">速度</span><el-rate :model-value="5" disabled show-score score-template="{value}/5" /></div>
            <div class="popover-score-row"><span class="popover-score-row-label">价格</span><span class="proapi">付费</span></div>
          </div>
          <div class="proapi-price-table">
            <div class="proapi-price-title">计费说明：</div>
            <div>每条成功请求 <span class="proapi-price">0.012元</span>，失败不计费。</div>
            <div class="proapi-table-title">阶梯式折扣：</div>
            <table class="proapi-table">
              <thead>
                <tr><th>每日请求数</th><th>折扣</th></tr>
              </thead>
              <tbody>
                <tr><td>0-1000</td><td>0%</td></tr>
                <tr><td>1000-5000</td><td>10%</td></tr>
                <tr><td>5000-10000</td><td>20%</td></tr>
                <tr><td>10000-20000</td><td>30%</td></tr>
                <tr><td>20000-30000</td><td>40%</td></tr>
                <tr><td>30000+</td><td>50%</td></tr>
              </tbody>
            </table>
          </div>
        </el-popover>
      </el-radio-group>
      <!-- Cookie管理表格，仅在API请求爬取时显示 -->
      <el-table
        v-if="crawlMethod === 'api'"
        :data="cookieList"
        style="margin-top: 16px; width: 100%;"
        size="small"
        border
      >
        <el-table-column type="index" label="序号" width="60" :index="cookieIndexMethod" />
        <el-table-column prop="cookie" label="Cookie" min-width="200">
          <template #default="scope">
            <span v-if="!scope.row.editing">{{ scope.row.cookie }}</span>
            <el-input
              v-else
              v-model="scope.row.editValue"
              size="small"
              style="width: 100%;"
              @keyup.enter="saveCookie(scope.$index)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
              v-if="!scope.row.editing"
              type="primary"
              icon="Edit"
              circle
              size="small"
              @click="editCookie(scope.$index)"
            />
            <el-button
              v-if="scope.row.editing"
              type="success"
              icon="Check"
              circle
              size="small"
              @click="saveCookie(scope.$index)"
            />
            <el-button
              type="danger"
              icon="Delete"
              circle
              size="small"
              @click="deleteCookie(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-button
        v-if="crawlMethod === 'api'"
        type="primary"
        size="small"
        style="margin-top: 8px;"
        @click="addCookie"
      >添加Cookie</el-button>
    </el-card>
    <el-row :gutter="20" class="main-row">
      <!-- 左侧功能区 -->
      <el-col :span="10" class="left-column">
        <!-- 指定用户提取uid -->
        <el-card class="box-card mb-15">
          <template #header>
            <div class="card-header">
              <span>指定用户提取UID</span>
            </div>
          </template>
          <el-row :gutter="10" align="middle">
            <el-col :span="16">
              <el-input v-model="userLink" placeholder="请输入用户主页链接" clearable></el-input>
            </el-col>
            <el-col :span="8" style="display: flex; justify-content: flex-end;">
              <el-button
                type="primary"
                style="min-width: 80px; padding: 0 16px; white-space: nowrap;"
                @click="extractUidFromLink"
                :loading="extractLoading"
              >
                开始爬取
              </el-button>
            </el-col>
          </el-row>
        </el-card>

        <!-- 关键词提取uid -->
        <el-card class="box-card mb-15 keyword-extract-card">
          <template #header>
            <div class="card-header">
              <span>关键词提取UID</span>
              <el-tooltip content="通过关键词批量筛选抖音用户" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form label-position="top" size="small" class="keyword-form">
            <!-- 关键词输入 -->
            <el-form-item label="关键词" class="form-item-full">
              <el-input v-model="keyword" placeholder="请输入关键词" clearable></el-input>
            </el-form-item>

            <!-- 参数区块，两列并排 -->
            <el-row :gutter="12" class="param-row">
              <el-col :span="12">
                <el-form-item label="目标用户量">
                  <el-input-number v-model="targetUserCount" :min="1" :max="500" class="w-100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序方式">
                  <el-select v-model="sortType" class="w-100">
                    <el-option label="综合排序" :value="0" />
                    <el-option label="最多点赞" :value="1" />
                    <el-option label="最新发布" :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发布时间">
                  <el-select v-model="publishTime" class="w-100">
                    <el-option label="不限" :value="0" />
                    <el-option label="最近一天" :value="1" />
                    <el-option label="最近一周" :value="7" />
                    <el-option label="最近半年" :value="180" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="视频时长">
                  <el-select v-model="filterDuration" class="w-100">
                    <el-option label="不限" :value="0" />
                    <el-option label="1分钟以内" :value="'0-1'" />
                    <el-option label="1-5分钟" :value="'1-5'" />
                    <el-option label="5分钟以上" :value="'5-10000'" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 操作按钮区 -->
            <el-form-item class="form-item-full btn-row">
              <el-button
                type="primary"
                class="w-100"
                @click="searchVideosByKeyword"
                :loading="searchLoading"
                size="large"
                style="font-weight:bold;letter-spacing:2px;"
              >
                <el-icon><Search /></el-icon>
                开始筛选
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 筛选当前用户粉丝列表 -->
        <el-card class="box-card flex-grow-card">
          <template #header>
            <div class="card-header">
              <span>筛选当前用户粉丝列表</span>
            </div>
          </template>

          <el-form label-position="left" label-width="100px" :inline="true" size="small" class="inline-form">
            <el-form-item label="筛选用户数量" class="flex-grow-item" style="flex:1;">
              <el-tooltip
                effect="dark"
                content="根据输入的数量筛选当前表格中的用户的粉丝，会按照顺序提取粉丝，筛选后会从数据库中删除掉这条用户"
                placement="top"
              >
                <el-input v-model="fansCount" placeholder="请输入需要提取的粉丝数量" type="number" :min="1" style="width:100%;" />
              </el-tooltip>
            </el-form-item>

            <el-form-item class="button-item" style="margin-left:10px;">
              <el-button type="primary" @click="filterUserFans" :loading="filterFansLoading" style="min-width:80px;white-space:nowrap;">开始筛选</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧表格区 -->
      <el-col :span="14" class="right-column">
        <el-card class="box-card flex-grow-card">
          <template #header>
            <div class="card-header">
              <span>用户数据列表</span>
              <el-button type="primary" size="small">导出数据</el-button>
            </div>
          </template>

          <div class="table-container">
            <el-table
              :data="tableData"
              border
              style="width: 100%"
              :cell-style="{ 'white-space': 'nowrap' }"
              :border="false"
              @sort-change="handleSortChange"
              v-loading="tableLoading"
              element-loading-text="数据加载中..."
            >
              <el-table-column label="序号" width="60" fixed="left" type="index" :index="indexMethod">
              </el-table-column>
              <el-table-column prop="nickname" label="用户昵称" min-width="120">
                <template #default="scope">
                  <span class="text-nowrap" :title="scope.row.nickname">{{ scope.row.nickname }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="user_age" label="年龄" width="60">
                <template #default="scope">
                  {{ formatAge(scope.row.user_age) }}
                </template>
              </el-table-column>
              <el-table-column label="性别" width="70">
                <template #default="scope">
                  <el-tag
                    :type="getGenderTagType(scope.row.gender)"
                    size="small"
                    effect="light"
                    class="gender-tag"
                  >
                    <span class="gender-content">
                      <el-icon class="gender-icon"><component :is="getGenderIcon(scope.row.gender)" /></el-icon>
                      <span>{{ formatGender(scope.row.gender) }}</span>
                    </span>
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="followers"
                label="粉丝数"
                min-width="100"
                sortable="custom"
              >
                <template #default="scope">
                  {{ formatFollowers(scope.row.followers) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="following"
                label="关注数"
                min-width="100"
                sortable="custom"
              >
                <template #default="scope">
                  {{ scope.row.following }}
                </template>
              </el-table-column>
              <el-table-column prop="uid" label="UID" min-width="120">
                <template #default="scope">
                  <div class="copy-container">
                    <span class="text-with-copy text-ellipsis" :title="scope.row.uid">{{ scope.row.uid }}</span>
                    <el-icon class="copy-btn" @click="copyToClipboard(scope.row.uid, '用户UID')"><CopyDocument /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sec_uid" label="Sec_UID" min-width="200">
                <template #default="scope">
                  <div class="copy-container">
                    <span class="text-with-copy text-ellipsis" :title="scope.row.sec_uid">{{ scope.row.sec_uid }}</span>
                    <el-icon class="copy-btn" @click="copyToClipboard(scope.row.sec_uid, 'Sec_UID')"><CopyDocument /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="80">
                <template #default="scope">
                  <el-button type="danger" icon="Delete" circle size="small" @click="handleDelete(scope.row)"></el-button>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="暂无数据" :image-size="80"></el-empty>
              </template>
            </el-table>
          </div>

          <div class="pagination-container">
            <el-pagination
              layout="total, prev, pager, next"
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              @current-change="handleCurrentChange">
            </el-pagination>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ipcApiRoute } from '@/api'
import { ipc } from '@/utils/ipcRenderer'

// 获取ipcRenderer
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

defineOptions({
  name: 'UserFilter'
})

// 页面加载状态
const pageLoading = ref(true)
// 表格加载状态
const tableLoading = ref(false)

// 指定用户提取
const userLink = ref('')

// 关键词提取
const keyword = ref('')
const targetUserCount = ref(30)
const sortType = ref(0)
const publishTime = ref(0)
const filterDuration = ref(0)
const searchLoading = ref(false)

// 表格数据状态
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 是否在实时提取中
const isExtracting = ref(false)
// 实时提取的用户数据临时存储
const extractedUsers = ref([])

// 排序相关
const sortParams = ref({
  prop: 'rowid',
  order: 'ASC'
})

// 提取状态
const extractLoading = ref(false)

// 粉丝筛选相关
const fansCount = ref(100)
const filterFansLoading = ref(false)

// 添加进度相关的状态
const extractionProgress = ref(0)
const notificationKey = ref(null)

// 定义通信频道
const IPC_CHANNEL = 'user-extracted'

// 筛选用户粉丝功能（暂时为空实现）
const filterUserFans = () => {
  if (!fansCount.value || fansCount.value <= 0) {
    ElMessage.warning('请输入有效的粉丝数量')
    return
  }

  filterFansLoading.value = true

  // 这里后续实现筛选逻辑
  setTimeout(() => {
    ElMessage.info('功能待实现')
    filterFansLoading.value = false
  }, 1000)
}

// 获取用户数据
const getUserList = async () => {
  if (!ipcRenderer) {
    pageLoading.value = false
    return;
  }

  tableLoading.value = true
  try {
    const options = {
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortParams.value.prop,
      sortOrder: sortParams.value.order
    }

    const result = await ipcRenderer.invoke(ipcApiRoute.userdb.getUserList, options)

    if (result && result.success) {
      tableData.value = result.data
      total.value = result.pagination.total
    } else {
      if (result && result.error) {
        console.error('获取用户列表失败:', result.error)
      }
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    tableLoading.value = false
    pageLoading.value = false // 完成首次数据加载后关闭页面加载遮罩
  }
}

// 处理分页变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  getUserList()
}

// 生成序号
const indexMethod = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1;
}

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  // 映射前端排序字段到后端字段
  const propMapping = {
    followers: 'followers',
    following: 'following'
  }

  // 如果是id列排序，修改为rowid
  if (prop === 'id') {
    prop = 'rowid';
  }

  sortParams.value = {
    prop: propMapping[prop] || prop,
    order: order === 'ascending' ? 'ASC' : 'DESC'
  }

  getUserList()
}

// 处理删除用户
const handleDelete = (row) => {
  if (!ipcRenderer) return;

  ElMessageBox.confirm(
    `确定要删除用户 "${row.nickname}" 吗?`,
    '确认删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      tableLoading.value = true
      const result = await ipcRenderer.invoke(ipcApiRoute.userdb.deleteUser, row.uid)

      if (result && result.success && result.deleted) {
        ElMessage.success('删除成功')
        // 自动更新数据
        getUserList()
      } else {
        ElMessage.error((result && result.error) || '删除失败')
        tableLoading.value = false
      }
    } catch (error) {
      console.error('删除操作失败:', error)
      ElMessage.error(`操作失败: ${error.message}`)
      tableLoading.value = false
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 格式化年龄显示
const formatAge = (age) => {
  if (age === -1 || age === null) return '未知'
  return age
}

// 复制内容到剪贴板
const copyToClipboard = (text, fieldName) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success(`${fieldName}已复制到剪贴板`)
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败，请手动选择后复制')
    })
}

// 格式化性别显示
const formatGender = (gender) => {
  if (gender === 1) return '男'
  if (gender === 2) return '女'
  return '无'
}

// 获取性别标签类型
const getGenderTagType = (gender) => {
  if (gender === 2) return 'danger'
  if (gender === 1) return 'primary'
  return 'info' // 未知性别用灰色
}

// 获取性别对应的图标
const getGenderIcon = (gender) => {
  if (gender === 2) return 'Female'
  if (gender === 1) return 'Male'
  return 'QuestionFilled' // 未知性别用问号图标
}

// 格式化粉丝数
const formatFollowers = (followers) => {
  if (followers >= 10000) {
    return (followers / 10000).toFixed(1) + 'w'
  } else if (followers >= 1000) {
    return (followers / 1000).toFixed(1) + 'k'
  }
  return followers
}

// 监听后端发送的实时用户提取消息
const setupIpcListeners = () => {
  if (!ipc) return

  // 先移除可能存在的旧监听器
  ipc.removeAllListeners(IPC_CHANNEL)

  // 使用ipc.on监听实时用户数据
  ipc.on(IPC_CHANNEL, (event, data) => {
    if (!data || !data.userInfo) return

    // 将新提取的用户添加到临时数组
    extractedUsers.value.push(data.userInfo)

    // 计算进度
    const progress = Math.min(Math.round((extractedUsers.value.length / targetUserCount.value) * 100), 99)
    extractionProgress.value = progress
    updateProgressNotification()

    // 如果当前页是第一页，则实时更新表格显示
    if (currentPage.value === 1) {
      // 如果正在提取中，则直接将新用户添加到表格前面
      // 同时保持表格只显示pageSize条数据
      const newTableData = [data.userInfo, ...tableData.value]
      if (newTableData.length > pageSize.value) {
        // 保持表格数据不超过页面大小
        newTableData.length = pageSize.value
      }
      tableData.value = newTableData

      // 更新总数
      total.value = total.value + 1
    } else {
      // 如果不是第一页，只更新总数，不改变表格显示
      total.value = total.value + 1
    }
  })
}

// 初始化页面数据
const initPageData = async () => {
  try {
    await getUserList()
  } catch (error) {
    console.error('初始化数据失败:', error)
    pageLoading.value = false
  }
}

// 监听分页和排序变化，自动刷新数据
watch([currentPage, pageSize, sortParams], () => {
  getUserList()
}, { deep: true })

// 组件挂载时获取数据
onMounted(() => {
  try {
    setupIpcListeners()
    initPageData()
  } catch (error) {
    console.error('组件挂载时出错:', error)
  }
})

// 在组件卸载时移除IPC监听
onUnmounted(() => {
  try {
    if (ipc) {
      ipc.removeAllListeners(IPC_CHANNEL)
    }
    // 如果有通知还在显示，关闭它
    if (notificationKey.value) {
      notificationKey.value.close()
    }
  } catch (error) {
    console.error('组件卸载时出错:', error)
  }
})

// 提取用户信息
const extractUidFromLink = async () => {
  if (!ipcRenderer) return;

  if (!userLink.value) {
    ElMessage.warning('请输入用户主页链接');
    return;
  }

  extractLoading.value = true;

  try {
    const result = await ipcRenderer.invoke(ipcApiRoute.userdb.extractUidFromLink, userLink.value);

    if (result && result.success) {
      ElMessage.success('提取用户信息成功并已保存到数据库');
      userLink.value = ''; // 清空输入框
      // 自动更新用户列表
      getUserList();
    } else {
      console.error('提取用户信息失败:', result?.error || '未知错误');
      ElMessage.error(result?.error || '提取用户信息失败');
    }
  } catch (error) {
    console.error('提取用户信息失败:', error);
    ElMessage.error(`提取失败: ${error.message}`);
  } finally {
    extractLoading.value = false;
  }
};

// 关键词搜索视频提取用户
const searchVideosByKeyword = async () => {
  if (!keyword.value) {
    ElMessage.warning('请输入关键词')
    return
  }

  if (!ipcRenderer) return

  searchLoading.value = true
  isExtracting.value = true
  // 清空之前提取的用户数据
  extractedUsers.value = []
  extractionProgress.value = 0

  // 创建进度通知
  notificationKey.value = ElNotification({
    title: '提取进度',
    message: h('div', { style: 'margin: 10px 0;' }, [
      h('div', { style: 'margin-bottom: 10px;' }, '正在提取用户数据...'),
      h('el-progress', {
        percentage: extractionProgress.value,
        'stroke-width': 15,
        status: extractionProgress.value === 100 ? 'success' : '',
        format: (percentage) => `${extractedUsers.value.length}/${targetUserCount.value}`,
        style: {
          width: '260px'
        }
      })
    ]),
    duration: 0,
    position: 'top-right',
    type: 'info',
    showClose: true,
    style: {
      width: '300px'
    }
  })

  try {
    const params = {
      keyword: keyword.value,
      targetUserCount: targetUserCount.value,
      sortType: sortType.value,
      publishTime: publishTime.value,
      filterDuration: filterDuration.value
    }

    const result = await ipcRenderer.invoke(ipcApiRoute.userdb.searchVideosByKeyword, params)

    if (result && result.success) {
      // 更新进度为100%
      extractionProgress.value = 100
      updateProgressNotification()

      // 延迟关闭通知
      setTimeout(() => {
        if (notificationKey.value) {
          notificationKey.value.close()
        }
      }, 2000)

      ElMessage.success(`提取完成！共获取${result.userCount}个用户`)
      // 重新加载第一页数据
      currentPage.value = 1
      getUserList()
    } else {
      if (result && result.error) {
        ElMessage.error(`提取失败: ${result.error}`)
      } else {
        ElMessage.error('提取失败')
      }
    }
  } catch (error) {
    console.error('提取用户失败:', error)
    ElMessage.error('提取用户失败')
  } finally {
    searchLoading.value = false
    isExtracting.value = false
  }
}

// 更新进度通知
const updateProgressNotification = () => {
  if (notificationKey.value) {
    notificationKey.value.message = h('div', { style: 'margin: 10px 0;' }, [
      h('div', { style: 'margin-bottom: 10px;' }, '正在提取用户数据...'),
      h('el-progress', {
        percentage: extractionProgress.value,
        'stroke-width': 15,
        status: extractionProgress.value === 100 ? 'success' : '',
        format: (percentage) => `${extractedUsers.value.length}/${targetUserCount.value}`,
        style: {
          width: '260px'
        }
      })
    ])
  }
}

const crawlMethod = ref('browser')
const cookieList = ref([])
function addCookie() {
  cookieList.value.push({ cookie: '', editing: true, editValue: '' });
}
function editCookie(index) {
  const row = cookieList.value[index];
  row.editing = true;
  row.editValue = row.cookie;
}
function saveCookie(index) {
  const row = cookieList.value[index];
  if (row.editValue.trim()) {
    row.cookie = row.editValue.trim();
    row.editing = false;
  }
}
function deleteCookie(index) {
  cookieList.value.splice(index, 1);
}
function cookieIndexMethod(index) {
  return index + 1;
}
</script>

<style>
.dark-popover {
  background: #23232b !important;
  color: #eee !important;
  border: 1px solid #222 !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.28) !important;
  border-radius: 10px !important;
  padding: 12px 16px !important;
}
.dark-popover .el-popper__arrow::before {
  background: #23232b !important;
  border: 1px solid #222 !important;
}
</style>

<style scoped>
.user-filter-container {
  padding: 10px;
}

.main-row {
  display: flex;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
}

.flex-grow-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.flex-grow-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 内联表单样式 */
.inline-form {
  display: flex;
  align-items: center;
  width: 100%;
}

.inline-form .flex-grow-item {
  flex: 1;
  margin-right: 10px;
}

.inline-form .button-item {
  margin-bottom: 0;
  margin-left: 0;
}

.inline-form .button-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  height: 100%;
}

.inline-form :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

.inline-form :deep(.el-form-item__content) {
  width: 100%;
}

.mt-10 {
  margin-top: 10px;
}

.mt-15 {
  margin-top: 15px;
}

.mt-20 {
  margin-top: 20px;
}

.mb-15 {
  margin-bottom: 15px;
}

.w-100 {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-container {
  overflow-x: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-form-item {
  margin-bottom: 10px;
}

.gender-tag {
  padding: 0 6px;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

.gender-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gender-icon {
  margin-right: 2px;
  font-size: 12px;
}

.copy-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.text-with-copy {
  padding-right: 24px;
  white-space: nowrap;
  width: 100%;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
  cursor: pointer;
  font-size: 16px;
}

.copy-btn:hover {
  color: #409EFF;
}

/* 覆盖表格的默认样式，去掉竖直边框 */
:deep(.el-table--border .el-table__inner-wrapper::after),
:deep(.el-table--border::after),
:deep(.el-table--border::before),
:deep(.el-table__border-left-patch),
:deep(.el-table__inner-wrapper::before),
:deep(.el-table--border .el-table__inner-wrapper tr td),
:deep(.el-table--border .el-table__inner-wrapper tr th.el-table__cell) {
  border-right: none !important;
}

:deep(.el-table__inner-wrapper) {
  border-right: 1px solid #EBEEF5;
}

:deep(.el-table__row td) {
  border-right: none !important;
  border-bottom: 1px solid #EBEEF5;
}

.text-nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 100%;
}

.crawl-method-card {
  /* 移除特殊样式，统一用 box-card 和 el-card 默认风格 */
  background: none;
  border-radius: unset;
  box-shadow: unset;
  border: unset;
  margin-bottom: unset;
  padding: unset;
}
.crawl-method-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}
.crawl-method-radio {
  margin: 10px 0 18px 0;
  display: flex;
  justify-content: center;
}
.crawl-method-desc {
  margin-top: 8px;
}
.crawl-method-compare {
  color: #eee;
  font-size: 14px;
}
.method-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}
.method-tip {
  margin-bottom: 8px;
  color: #b0b0b0;
}
.method-score {
  margin-top: 4px;
  color: #fff;
}
.highlight {
  color: #ffd700;
  font-weight: bold;
}
.free {
  color: #67c23a;
  font-weight: bold;
}
.proapi {
  color: #f56c6c;
  font-weight: bold;
}
.popover-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
  color: #ffd700;
}
.popover-tip {
  margin-bottom: 8px;
  color: #b0b0b0;
}
.popover-score {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  height: 90px;
}
.popover-score-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}
.popover-score-row-label {
  min-width: 36px;
  text-align: right;
}
.proapi-desc {
  display: block;
  color: #b0b0b0;
  font-size: 13px;
  margin-top: 2px;
}
.proapi-price-table {
  margin-top: 8px;
  font-size: 13px;
  color: #eee;
}
.proapi-price-title {
  font-weight: bold;
  margin-bottom: 2px;
  color: #ffd700;
}
.proapi-price {
  color: #ffd700;
  font-weight: bold;
}
.proapi-table-title {
  margin-top: 4px;
  font-weight: bold;
  color: #ffd700;
}
.proapi-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2px;
}
.proapi-table th, .proapi-table td {
  border: 1px solid #444;
  padding: 2px 6px;
  text-align: center;
  font-size: 12px;
}
.proapi-table th {
  background: #23232b;
  color: #ffd700;
}
.proapi-table td {
  background: #23232b;
  color: #eee;
}
</style>
