<template>
  <div class="auto-text-reply-container">
    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧设置区 -->
      <div class="left-panel">
        <div class="panel-section">
          <div class="setting-item">
            <div class="setting-label">播放间隔设置</div>
            <div class="time-inputs">
              <el-input v-model.number="audioSettings.minInterval" size="small" style="width: 60px" />
              <span class="separator">—</span>
              <el-input v-model.number="audioSettings.maxInterval" size="small" style="width: 60px" />
              <span class="unit">秒</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">播放模式</div>
            <div class="play-mode">
              <el-radio-group v-model="audioSettings.playMode" size="small">
                <el-radio :value="'random'" label="随机播放"></el-radio>
                <el-radio :value="'sequential'" label="顺序播放"></el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- 随机插播设置区域 -->
          <div class="setting-item">
            <div class="setting-label">随机插播</div>
            <div class="random-broadcast">
              <el-switch v-model="randomBroadcastSettings.enabled" />
            </div>
          </div>
          
          <div v-if="randomBroadcastSettings.enabled" class="setting-item">
            <div class="setting-label">插播间隔</div>
            <div class="time-inputs">
              <el-input v-model.number="randomBroadcastSettings.minInterval" size="small" style="width: 60px" />
              <span class="separator">—</span>
              <el-input v-model.number="randomBroadcastSettings.maxInterval" size="small" style="width: 60px" />
              <span class="unit">秒</span>
            </div>
          </div>
          
          <div v-if="randomBroadcastSettings.enabled" class="setting-item">
            <div class="setting-label">插播概率</div>
            <div class="probability-slider">
              <el-slider v-model="randomBroadcastSettings.probability" :min="1" :max="100" :step="1" :show-tooltip="false" />
              <span class="slider-value">{{ randomBroadcastSettings.probability }}%</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">输出设备</div>
            <div class="device-selector">
              <el-select v-model="selectedAudioDevice" placeholder="选择音频输出设备" style="width: 100%;" @change="updateAudioDevice">
                <el-option
                  v-for="device in audioDevices"
                  :key="device.index"
                  :label="device.name"
                  :value="device.index"
                />
              </el-select>
              <el-button size="small" @click="refreshAudioDevices" :loading="loadingAudioDevices" class="refresh-btn">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">播放音量</div>
            <div class="voice-slider">
              <el-slider v-model="audioSettings.volume" :min="0" :max="100" :step="1" :show-tooltip="false" />
              <span class="slider-value">{{ audioSettings.volume }}%</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">播放倍速</div>
            <div class="voice-slider">
              <el-slider v-model="audioSettings.playbackRate" :min="0.5" :max="2" :step="0.1" :show-tooltip="false" />
              <span class="slider-value">{{ audioSettings.playbackRate.toFixed(1) }}x</span>
            </div>
          </div>

          <div class="tips-box">
            <div class="tip-line">友情提示：</div>
            <div class="tip-line">• 播放间隔建议30-60秒</div>
            <div class="tip-line">• 音频文件放在extraResources/audio文件夹</div>
            <div class="tip-line">• 每个子文件夹代表一个音频组</div>
            <div class="tip-line">• 支持MP3, WAV等格式</div>
            <div class="tip-line">• 按子文件夹顺序播放，每次随机选一个</div>
          </div>

          <el-button
            :type="isVoiceEnabled ? 'danger' : 'success'"
            @click="isVoiceEnabled ? disableVoiceAssistant() : enableVoiceAssistant()"
            :loading="loading"
            :disabled="!selectedAudioGroup"
            class="control-button"
          >
            {{ isVoiceEnabled ? '停止语音助手' : '启动语音助手' }}
          </el-button>
        </div>
      </div>

      <!-- 右侧音频文件列表区 -->
      <div class="right-panel">
        <div class="panel-section">
          <!-- 表格上方的操作区域 -->
          <div class="table-header">
            <div class="left-controls">
              <div class="group-selector">
                <span class="selector-label">音频组:</span>
                <el-select v-model="selectedAudioGroup" placeholder="选择音频组" size="small" class="group-select" @change="getSubFolders(selectedAudioGroup)">
                  <el-option
                    v-for="group in audioGroups"
                    :key="group"
                    :label="group"
                    :value="group"
                  />
                </el-select>
                <el-button size="small" @click="refreshAudioGroups" :loading="loadingAudioGroups" class="refresh-btn">
                  <el-icon><Refresh /></el-icon>
                </el-button>
                <el-button size="small" @click="openAudioGroupFolder" class="folder-btn">
                  <el-icon><Folder /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 随机插播设置 -->
          <div v-if="randomBroadcastSettings.enabled" class="broadcast-settings">
            <div class="broadcast-group-selector">
              <div class="setting-item">
                <div class="setting-label">时间音频组:</div>
                <div class="time-group-select">
                  <el-select v-model="randomBroadcastSettings.timeGroupPath" placeholder="选择时间音频组" size="small" style="width: 100%">
                    <el-option
                      v-for="group in broadcastGroups.timeGroups"
                      :key="group.path"
                      :label="group.name"
                      :value="group.path"
                    />
                  </el-select>
                  <el-button size="small" @click="loadBroadcastGroups" :loading="loadingBroadcastGroups" class="refresh-btn">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">人数音频组:</div>
                <div class="time-group-select">
                  <el-select v-model="randomBroadcastSettings.viewerGroupPath" placeholder="选择人数音频组" size="small" style="width: 100%">
                    <el-option
                      v-for="group in broadcastGroups.viewerGroups"
                      :key="group.path"
                      :label="group.name"
                      :value="group.path"
                    />
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <!-- 子文件夹表格 -->
          <el-table
            :data="subFolders"
            border
            style="width: 100%"
            max-height="350"
            stripe
            size="small"
            v-loading="loadingSubFolders"
          >
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="name" label="子文件夹名称">
              <template #default="scope">
                <div class="file-name">{{ scope.row.name }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="audioCount" label="音频数量" width="100" align="center">
              <template #default="scope">
                <el-tag size="small" type="info">{{ scope.row.audioCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button link size="small" @click="openSubFolder(scope.row)">查看</el-button>
                <el-button link size="small" @click="playTestAudio(scope.row)">测试</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject, onBeforeUnmount } from 'vue';
import { ipcApiRoute } from '@/api';
import { voiceAssistantApi } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';
import { Refresh, Folder } from '@element-plus/icons-vue';
import { useLivechatStore } from '@/stores/livechatStore';
import axios from 'axios';
import { debounce } from 'lodash';

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);
const livechatStore = useLivechatStore();

// 状态变量
const roomId = ref(sharedState?.roomId || livechatStore.roomId || '');
const connected = ref(sharedState?.connected || livechatStore.connected || false);
const isVoiceEnabled = ref(false);
const loading = ref(false);
const pythonBaseUrl = ref('');

// 音频组
const audioGroups = ref([]);
const selectedAudioGroup = ref('');
const audioFiles = ref([]);
const subFolders = ref([]);  // 添加子文件夹列表
const loadingAudioGroups = ref(false);
const loadingAudioFiles = ref(false);
const loadingSubFolders = ref(false);  // 添加子文件夹加载状态标记

// 音频设备
const audioDevices = ref([]);
const selectedAudioDevice = ref(null);
const loadingAudioDevices = ref(false);

// 音频播放设置
const audioSettings = ref({
  volume: 80,
  playbackRate: 1.0,
  minInterval: 5,
  maxInterval: 10,
  playMode: 'random',
  deviceId: null // 用于存储选中的设备ID
});

// 随机插播设置
const randomBroadcastSettings = ref({
  enabled: false,
  minInterval: 300, // 默认最小间隔5分钟
  maxInterval: 600, // 默认最大间隔10分钟
  probability: 30, // 默认30%的概率
  timeGroupPath: '',
  viewerGroupPath: '', 
  lastBroadcastTime: 0, // 上次插播时间
  nextBroadcastTime: 0 // 下次插播时间
});

// 插播音频组
const broadcastGroups = ref({
  timeGroups: [],
  viewerGroups: []
});
const loadingBroadcastGroups = ref(false);

// 直播间信息
const liveRoomInfo = ref({
  viewers: 0, // 当前观看人数
  lastUpdateTime: 0 // 最后更新时间
});

// 加载保存的音频设置
const loadAudioSettings = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'get',
      table: 'settings',
      key: 'audioSettings'
    });

    if (result && result.status === 'success' && result.data) {
      // 合并保存的设置，保留默认值作为备选
      const savedSettings = result.data;
      audioSettings.value = {
        ...audioSettings.value,
        ...savedSettings
      };
      console.log('已加载音频设置:', audioSettings.value);
    }
  } catch (error) {
    console.error('加载音频设置出错:', error);
  }
};

// 保存音频设置
const saveAudioSettings = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'set',
      table: 'settings',
      key: 'audioSettings',
      value: {
        volume: audioSettings.value.volume,
        playbackRate: audioSettings.value.playbackRate,
        minInterval: audioSettings.value.minInterval,
        maxInterval: audioSettings.value.maxInterval,
        playMode: audioSettings.value.playMode,
        timestamp: new Date().getTime()
      }
    });

    if (result && result.status === 'success') {
      console.log('音频设置已保存');
    } else {
      console.error('保存音频设置失败:', result?.message);
    }
  } catch (error) {
    console.error('保存音频设置出错:', error);
  }
};

// 监听音频设置变化，保存设置
watch([
  () => audioSettings.value.volume,
  () => audioSettings.value.playbackRate,
  () => audioSettings.value.minInterval,
  () => audioSettings.value.maxInterval,
  () => audioSettings.value.playMode
], debounce(() => {
  saveAudioSettings();
}, 500));

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 获取Python服务的基础URL
const getPythonBaseUrl = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.cross.getCrossUrl, { name: 'AudioPlayer' });
    if (result) {
      pythonBaseUrl.value = result;
      console.log('Python服务基础URL:', pythonBaseUrl.value);
      return result;
    } else {
      console.error('获取Python服务基础URL失败');
      ElMessage.error('获取Python服务基础URL失败');
      return null;
    }
  } catch (error) {
    console.error('获取Python服务基础URL出错:', error);
    ElMessage.error('获取Python服务基础URL出错: ' + (error.message || '未知错误'));
    return null;
  }
};

// 获取音频设备列表 - 使用Python服务
const getAudioDevices = async () => {
  loadingAudioDevices.value = true;
  try {
    const baseUrl = pythonBaseUrl.value || await getPythonBaseUrl();
    if (!baseUrl) {
      throw new Error('无法获取Python服务地址');
    }

    const response = await axios.get(`${baseUrl}/api/devices`);

    if (response.data && response.data.code === 0) {
      audioDevices.value = response.data.data;
      console.log('获取到音频输出设备列表:', audioDevices.value);

      // 首先尝试加载保存的设备设置
      const savedSettings = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
        action: 'get',
        table: 'settings',
        key: 'audioDevice'
      });

      if (savedSettings && savedSettings.status === 'success' && savedSettings.data) {
        const savedDeviceId = savedSettings.data.deviceId;
        // 检查保存的设备是否在当前设备列表中
        const deviceExists = audioDevices.value.some(d => d.index === savedDeviceId);

        if (deviceExists) {
          selectedAudioDevice.value = savedDeviceId;
          audioSettings.value.deviceId = savedDeviceId;
          console.log('已恢复设备设置:', savedDeviceId);
          return;  // 已找到保存的设备，不需要默认选择第一个设备
        } else {
          console.log('保存的设备不在当前设备列表中');
        }
      }

      // 如果没有保存的设备设置或设备不存在，则选择第一个设备
      if (audioDevices.value.length > 0 && !selectedAudioDevice.value) {
        selectedAudioDevice.value = audioDevices.value[0].index;
        audioSettings.value.deviceId = selectedAudioDevice.value;
        // 保存第一个设备作为默认设备
        saveDeviceSetting(selectedAudioDevice.value);
      }
    } else {
      throw new Error(response.data?.message || '获取设备列表失败');
    }
  } catch (error) {
    console.error('获取音频设备列表出错:', error);
    ElMessage.error('获取音频设备列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingAudioDevices.value = false;
  }
};

// 刷新音频设备列表
const refreshAudioDevices = async () => {
  await getAudioDevices();
};

// 更新选中的音频设备
const updateAudioDevice = (deviceId) => {
  audioSettings.value.deviceId = deviceId;
  // 保存设备ID到设置中，后续会通过API传递给后端
  console.log('已选择音频设备:', deviceId);
  // 查找设备名称，用于显示
  const device = audioDevices.value.find(d => d.index === deviceId);
  if (device) {
    ElMessage.success(`已选择输出设备: ${device.name || '默认设备'}`);
    // 保存设备设置到本地存储
    saveDeviceSetting(deviceId);
  }
};

// 保存设备设置到本地存储
const saveDeviceSetting = async (deviceId) => {
  try {
    // 使用jsondb保存设备设置
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'set',
      table: 'settings',
      key: 'audioDevice',
      value: {
        deviceId: deviceId,
        timestamp: new Date().getTime()
      }
    });

    if (result && result.status === 'success') {
      console.log('设备设置已保存');
    } else {
      console.error('保存设备设置失败:', result?.message);
    }
  } catch (error) {
    console.error('保存设备设置出错:', error);
  }
};

// 加载保存的设备设置
const loadDeviceSetting = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'get',
      table: 'settings',
      key: 'audioDevice'
    });

    if (result && result.status === 'success' && result.data) {
      const savedDevice = result.data;
      console.log('加载到保存的设备设置:', savedDevice);

      // 如果设备列表已加载，检查设备是否存在
      if (audioDevices.value.length > 0) {
        const deviceExists = audioDevices.value.some(d => d.index === savedDevice.deviceId);
        if (deviceExists) {
          selectedAudioDevice.value = savedDevice.deviceId;
          audioSettings.value.deviceId = savedDevice.deviceId;
          console.log('已恢复设备设置:', savedDevice.deviceId);
        } else {
          console.log('保存的设备不存在于当前设备列表中');
        }
      } else {
        // 设备列表尚未加载，先保存设置，等设备列表加载后再检查
        const tempDeviceId = savedDevice.deviceId;
        // 在getAudioDevices函数完成后会检查这个临时设备ID
        // 见下面对getAudioDevices函数的修改
      }
    }
  } catch (error) {
    console.error('加载设备设置出错:', error);
  }
};

// 保存当前选择的音频组
const saveSelectedAudioGroup = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'set',
      table: 'settings',
      key: 'selectedAudioGroup',
      value: {
        groupName: selectedAudioGroup.value,
        timestamp: new Date().getTime()
      }
    });

    if (result && result.status === 'success') {
      console.log('音频组选择已保存:', selectedAudioGroup.value);
    } else {
      console.error('保存音频组选择失败:', result?.message);
    }
  } catch (error) {
    console.error('保存音频组选择出错:', error);
  }
};

// 加载保存的音频组选择
const loadSelectedAudioGroup = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'get',
      table: 'settings',
      key: 'selectedAudioGroup'
    });

    if (result && result.status === 'success' && result.data && result.data.groupName) {
      console.log('加载到保存的音频组选择:', result.data.groupName);
      return result.data.groupName;
    }
  } catch (error) {
    console.error('加载音频组选择出错:', error);
  }
  return null;
};

// 获取音频组列表
const getAudioGroups = async () => {
  loadingAudioGroups.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getAudioGroups);
    if (result && result.status === 'success' && result.data) {
      audioGroups.value = result.data;
      console.log('获取到音频组列表:', audioGroups.value);

      // 加载上次保存的音频组选择
      const savedGroup = await loadSelectedAudioGroup();
      
      // 如果有保存的选择并且该组仍然存在
      if (savedGroup && audioGroups.value.includes(savedGroup)) {
        selectedAudioGroup.value = savedGroup;
        console.log('已恢复保存的音频组选择:', savedGroup);
      } 
      // 如果当前选择的组不存在于列表中，或者没有选择
      else if (!selectedAudioGroup.value || !audioGroups.value.includes(selectedAudioGroup.value)) {
        selectedAudioGroup.value = audioGroups.value.length > 0 ? audioGroups.value[0] : '';
      }
    } else {
      console.error('获取音频组列表失败:', result?.message);
      ElMessage.warning('获取音频组列表失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取音频组列表出错:', error);
    ElMessage.error('获取音频组列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingAudioGroups.value = false;
  }
};

// 刷新音频组列表
const refreshAudioGroups = async () => {
  await getAudioGroups();
};

// 获取音频文件列表
const getAudioFiles = async (groupName) => {
  if (!groupName) return;

  loadingAudioFiles.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getAudioFiles, { groupName });
    if (result && result.status === 'success' && result.data) {
      audioFiles.value = result.data;
      console.log('获取到音频文件列表:', audioFiles.value);
    } else {
      console.error('获取音频文件列表失败:', result?.message);
      audioFiles.value = [];
      ElMessage.warning('获取音频文件列表失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取音频文件列表出错:', error);
    audioFiles.value = [];
    ElMessage.error('获取音频文件列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingAudioFiles.value = false;
  }
};

// 播放单个音频文件（测试用） - 使用Python服务
const playAudioFile = async (file) => {
  try {
    console.log('请求播放音频文件:', file.path);

    if (!selectedAudioDevice.value) {
      ElMessage.warning('请先选择音频输出设备');
      return;
    }

    const baseUrl = pythonBaseUrl.value || await getPythonBaseUrl();
    if (!baseUrl) {
      throw new Error('无法获取Python服务地址');
    }

    // 先获取音频文件时长
    const durationResponse = await axios.post(`${baseUrl}/api/get_duration`, {
      file_path: file.path
    });

    if (!durationResponse.data || durationResponse.data.code !== 0) {
      throw new Error('获取音频时长失败');
    }

    const duration = durationResponse.data.data.duration; // 音频时长（秒）
    console.log('音频文件时长:', duration, '秒');

    // 使用Python服务API播放音频
    const response = await axios.post(`${baseUrl}/api/play`, {
      file_path: file.path,
      device_id: selectedAudioDevice.value,
      playback_speed: audioSettings.value.playbackRate
    });

    if (response.data && response.data.code === 0) {
      ElMessage.success('开始播放音频文件');

      // 计算实际播放时长（考虑播放速度）
      const actualDuration = duration / audioSettings.value.playbackRate;
      console.log('实际播放时长:', actualDuration, '秒');

      // 等待音频播放完成
      await new Promise(resolve => setTimeout(resolve, actualDuration * 1000));

      // 计算随机等待时间（秒）
      const minInterval = audioSettings.value.minInterval;
      const maxInterval = audioSettings.value.maxInterval;
      const randomWaitTime = Math.floor(minInterval + Math.random() * (maxInterval - minInterval));

      // 显示等待时间
      ElMessage.info(`等待 ${randomWaitTime} 秒后播放下一个音频`);

      // 等待随机时间
      await new Promise(resolve => setTimeout(resolve, randomWaitTime * 1000));

      // 如果语音助手仍在运行，继续播放下一个音频
      if (isVoiceEnabled.value) {
        // 根据播放模式选择下一个音频
        let nextFile;
        if (audioSettings.value.playMode === 'random') {
          const randomIndex = Math.floor(Math.random() * audioFiles.value.length);
          nextFile = audioFiles.value[randomIndex];
        } else {
          // 顺序播放模式
          const currentIndex = audioFiles.value.findIndex(f => f.path === file.path);
          const nextIndex = (currentIndex + 1) % audioFiles.value.length;
          nextFile = audioFiles.value[nextIndex];
        }

        // 播放下一个音频
        await playAudioFile(nextFile);
      }
    } else {
      ElMessage.error(response.data?.message || '播放音频失败');
    }
  } catch (error) {
    console.error('播放音频请求出错:', error);
    ElMessage.error('播放音频请求出错: ' + (error.message || '未知错误'));
  }
};

// 停止当前音频播放
const stopAudioPlayback = async () => {
  try {
    const baseUrl = pythonBaseUrl.value || await getPythonBaseUrl();
    if (!baseUrl) {
      throw new Error('无法获取Python服务地址');
    }

    // 使用Python服务API停止播放
    const response = await axios.post(`${baseUrl}/api/stop`);

    if (response.data && response.data.code === 0) {
      console.log('已停止音频播放');
    } else {
      console.error('停止音频播放失败:', response.data?.message);
    }
  } catch (error) {
    console.error('停止音频播放出错:', error);
  }
};

// 启用语音助手
const enableVoiceAssistant = async () => {
  if (!selectedAudioGroup.value) {
    ElMessage.warning('请先选择一个音频组');
    return;
  }

  if (!selectedAudioDevice.value) {
    ElMessage.warning('请先选择音频输出设备');
    return;
  }

  if (subFolders.value.length === 0) {
    ElMessage.warning('所选音频组没有子文件夹');
    return;
  }

  loading.value = true;
  try {
    // 创建一个只包含简单数据类型的设置对象
    const simpleSettings = {
      volume: Number(audioSettings.value.volume),
      playbackRate: Number(audioSettings.value.playbackRate),
      minInterval: Number(audioSettings.value.minInterval),
      maxInterval: Number(audioSettings.value.maxInterval),
      deviceId: Number(selectedAudioDevice.value) // 添加设备ID
    };

    // 使用新的播放模式API
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.startNewPlayMode, {
      groupName: selectedAudioGroup.value,
      settings: simpleSettings
    });

    if (result && result.status === 'success') {
      isVoiceEnabled.value = true;
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addVoiceAssistantLog(`语音助手已启用，使用音频组: ${selectedAudioGroup.value}`);
      }
      ElMessage.success('已启动语音助手（子文件夹模式）');
      
      // 开始播放循环
      startPlaybackLoop();
    } else {
      ElMessage.error(result?.message || '启动语音助手失败');
    }
  } catch (error) {
    console.error('启动语音助手出错:', error);
    ElMessage.error(`启动语音助手失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

// 播放循环
let playbackTimer = null;
const currentFolderIndex = ref(0);

// 开始播放循环
const startPlaybackLoop = async () => {
  if (!isVoiceEnabled.value || subFolders.value.length === 0) {
    return;
  }
  
  try {
    // 检查是否需要插播
    if (shouldBroadcast()) {
      console.log('触发随机插播');
      const broadcastSuccess = await playBroadcast();
      
      // 无论插播是否成功，都设置一个定时器继续正常的播放循环
      playbackTimer = setTimeout(() => {
        if (isVoiceEnabled.value) {
          startPlaybackLoop();
        }
      }, 5000);
      
      // 如果插播成功，则本次循环结束，不继续播放普通音频
      if (broadcastSuccess) {
        return;
      }
      // 如果插播失败，则继续正常的播放流程
    }
    
    // 获取当前要播放的子文件夹
    const folder = subFolders.value[currentFolderIndex.value];
    console.log(`准备播放子文件夹: ${folder.name}`);
    
    // 调用API播放该子文件夹中的随机音频
    const response = await voiceAssistantApi.playSubFolderAudio(
      `${selectedAudioGroup.value}/${folder.name}`
    );
    
    if (response.status === 'success' && response.data) {
      const { file, duration, actualDuration } = response.data;
      console.log(`播放音频: ${file.name}, 时长: ${duration}秒, 实际播放时长: ${actualDuration}秒`);
      
      // 在控制台显示完整的文件路径
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addVoiceAssistantLog(`播放音频文件: ${file.path}`);
      }
      
      // 更新到下一个文件夹索引
      currentFolderIndex.value = (currentFolderIndex.value + 1) % subFolders.value.length;
      
      // 计算随机等待时间
      const minInterval = audioSettings.value.minInterval;
      const maxInterval = audioSettings.value.maxInterval;
      const waitTime = Math.floor(minInterval + Math.random() * (maxInterval - minInterval));
      console.log(`音频播放后等待 ${waitTime} 秒, `);
      
      // 等待音频播放完成加上间隔时间后，再播放下一个
      playbackTimer = setTimeout(() => {
        if (isVoiceEnabled.value) {
          startPlaybackLoop();
        }
      }, waitTime * 1000);
    } else {
      console.error('播放音频失败:', response.message);
      // 出错时仍然继续尝试下一个文件夹
      currentFolderIndex.value = (currentFolderIndex.value + 1) % subFolders.value.length;
      
      // 5秒后重试
      playbackTimer = setTimeout(() => {
        if (isVoiceEnabled.value) {
          startPlaybackLoop();
        }
      }, 5000);
    }
  } catch (error) {
    console.error('播放循环出错:', error);
    // 出错时仍然继续尝试
    playbackTimer = setTimeout(() => {
      if (isVoiceEnabled.value) {
        startPlaybackLoop();
      }
    }, 5000);
  }
};

// 停止语音助手
const disableVoiceAssistant = async () => {
  loading.value = true;
  try {
    // 清除播放定时器
    if (playbackTimer) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
    
    // 首先停止当前音频播放
    await stopAudioPlayback();

    // 调用后端API停用语音助手
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.stopVoiceAssistant);

    if (result && result.status === 'success') {
      isVoiceEnabled.value = false;
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addVoiceAssistantLog('语音助手已停用');
      }
      ElMessage.success('已停止语音助手');
    } else {
      ElMessage.error(result?.message || '停止语音助手失败');
    }
  } catch (error) {
    console.error('停止语音助手出错:', error);
    ElMessage.error(`停止语音助手失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

// 检查语音助手状态
const checkVoiceAssistantStatus = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getVoiceAssistantStatus);
    if (result && result.status === 'success' && result.data) {
      const { isEnabled, currentGroup, settings } = result.data;
      isVoiceEnabled.value = isEnabled;

      if (isEnabled && currentGroup) {
        selectedAudioGroup.value = currentGroup;

        // 更新设置
        if (settings) {
          audioSettings.value = { ...audioSettings.value, ...settings };
          if (settings.deviceId) {
            selectedAudioDevice.value = settings.deviceId;
          }
        }

        console.log('语音助手已启用，使用音频组:', currentGroup);
      }
    }
  } catch (error) {
    console.error('检查语音助手状态出错:', error);
  }
};

// 监听选中的音频组变化
watch(selectedAudioGroup, (newGroup) => {
  if (newGroup) {
    getSubFolders(newGroup);
    // 保存选择
    saveSelectedAudioGroup();
  } else {
    subFolders.value = [];
  }
});

// 监听共享状态中的连接状态变化
watch([() => sharedState?.connected, () => livechatStore.connected], ([newSharedConnected, newStoreConnected]) => {
  const newConnected = newSharedConnected !== undefined ? newSharedConnected : newStoreConnected;
  if (connected.value !== newConnected) {
    connected.value = newConnected;
    console.log('连接状态变化:', connected.value);
  }
}, { immediate: true });

// 监听共享状态中的房间ID变化
watch([() => sharedState?.roomId, () => livechatStore.roomId], ([newSharedRoomId, newStoreRoomId]) => {
  const newRoomId = newSharedRoomId || newStoreRoomId;
  if (roomId.value !== newRoomId) {
    roomId.value = newRoomId;
    console.log('房间ID变化:', roomId.value);
  }
}, { immediate: true });

// 打开音频组文件夹
const openAudioGroupFolder = async () => {
  if (!selectedAudioGroup.value) {
    ElMessage.warning('请先选择一个音频组');
    return;
  }

  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.openAudioGroupFolder, {
      groupName: selectedAudioGroup.value
    });

    if (result && result.status === 'success') {
      ElMessage.success('已打开音频组文件夹');
    } else {
      ElMessage.error(result?.message || '打开文件夹失败');
    }
  } catch (error) {
    console.error('打开文件夹出错:', error);
    ElMessage.error('打开文件夹出错: ' + (error.message || '未知错误'));
  }
};

// 获取子文件夹列表
const getSubFolders = async (groupName) => {
  if (!groupName) return;

  loadingSubFolders.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getSubFolders, { groupName });
    if (result && result.status === 'success' && result.data) {
      subFolders.value = result.data;
      console.log('获取到子文件夹列表:', subFolders.value);
    } else {
      console.error('获取子文件夹列表失败:', result?.message);
      subFolders.value = [];
      ElMessage.warning('获取子文件夹列表失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取子文件夹列表出错:', error);
    subFolders.value = [];
    ElMessage.error('获取子文件夹列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingSubFolders.value = false;
  }
};

// 打开子文件夹
const openSubFolder = async (folder) => {
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.openAudioGroupFolder, {
      groupName: `${selectedAudioGroup.value}/${folder.name}`
    });

    if (result && result.status === 'success') {
      ElMessage.success('已打开子文件夹');
    } else {
      ElMessage.error(result?.message || '打开文件夹失败');
    }
  } catch (error) {
    console.error('打开文件夹出错:', error);
    ElMessage.error('打开文件夹出错: ' + (error.message || '未知错误'));
  }
};

// 从子文件夹中随机播放一个音频进行测试
const playTestAudio = async (folder) => {
  try {
    if (!selectedAudioDevice.value) {
      ElMessage.warning('请先选择音频输出设备');
      return;
    }

    // 先获取该文件夹下的所有音频文件
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getAudioFiles, {
      groupName: `${selectedAudioGroup.value}/${folder.name}`
    });

    if (result && result.status === 'success' && result.data && result.data.length > 0) {
      const files = result.data;
      // 随机选择一个文件播放
      const randomIndex = Math.floor(Math.random() * files.length);
      const file = files[randomIndex];

      // 播放前显示完整路径
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addVoiceAssistantLog(`测试播放音频文件: ${file.path}`);
      }

      playAudioFile(file);
    } else {
      ElMessage.warning('该文件夹中没有可播放的音频文件');
    }
  } catch (error) {
    console.error('测试播放出错:', error);
    ElMessage.error('测试播放出错: ' + (error.message || '未知错误'));
  }
};

// 加载时间和人数音频组
const loadBroadcastGroups = async () => {
  loadingBroadcastGroups.value = true;
  try {
    // 获取报时及人数录音文件夹下的音频组
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getBroadcastGroups);
    if (result && result.status === 'success' && result.data) {
      broadcastGroups.value = result.data;
      console.log('获取到插播音频组:', broadcastGroups.value);
      
      // 如果有可用的时间组和人数组，且没有之前保存的选择，则默认选择第一个
      if (broadcastGroups.value.timeGroups.length > 0 && !randomBroadcastSettings.value.timeGroupPath) {
        randomBroadcastSettings.value.timeGroupPath = broadcastGroups.value.timeGroups[0].path;
      }
      
      if (broadcastGroups.value.viewerGroups.length > 0 && !randomBroadcastSettings.value.viewerGroupPath) {
        randomBroadcastSettings.value.viewerGroupPath = broadcastGroups.value.viewerGroups[0].path;
      }
      
      // 验证保存的音频组路径是否仍然有效
      if (randomBroadcastSettings.value.timeGroupPath) {
        const timeGroupExists = broadcastGroups.value.timeGroups.some(
          g => g.path === randomBroadcastSettings.value.timeGroupPath
        );
        if (!timeGroupExists && broadcastGroups.value.timeGroups.length > 0) {
          randomBroadcastSettings.value.timeGroupPath = broadcastGroups.value.timeGroups[0].path;
        }
      }
      
      if (randomBroadcastSettings.value.viewerGroupPath) {
        const viewerGroupExists = broadcastGroups.value.viewerGroups.some(
          g => g.path === randomBroadcastSettings.value.viewerGroupPath
        );
        if (!viewerGroupExists && broadcastGroups.value.viewerGroups.length > 0) {
          randomBroadcastSettings.value.viewerGroupPath = broadcastGroups.value.viewerGroups[0].path;
        }
      }
      
      // 如果已有选择，保存设置确保持久化
      if (randomBroadcastSettings.value.timeGroupPath || randomBroadcastSettings.value.viewerGroupPath) {
        saveRandomBroadcastSettings();
      }
    } else {
      console.error('获取插播音频组失败:', result?.message);
      ElMessage.warning('获取插播音频组失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取插播音频组出错:', error);
    ElMessage.error('获取插播音频组出错: ' + (error.message || '未知错误'));
  } finally {
    loadingBroadcastGroups.value = false;
  }
};

// 监听直播间消息更新观看人数
const setupLiveRoomListener = () => {
  // 监听直播间消息
  ipc.on('livechat-message', (event, message) => {
    if (message && (message.type === 'room_stats' || message.type === 'room_user_seq')) {
      // 解析观看人数
      if (message.message) {
        // 匹配类似 "【统计msg】当前观看人数: 123, 累计观看人数: 456" 的格式
        const match = message.message.match(/当前观看人数[:：]\s*(\d+)/);
        if (match && match[1]) {
          liveRoomInfo.value.viewers = parseInt(match[1], 10);
          liveRoomInfo.value.lastUpdateTime = Date.now();
          console.log('更新直播间观看人数:', liveRoomInfo.value.viewers);
        }
      }
    }
  });
};

// 播放报时和人数插播
const playBroadcast = async () => {
  try {
    if (!randomBroadcastSettings.value.timeGroupPath || !randomBroadcastSettings.value.viewerGroupPath) {
      console.error('未选择时间或人数音频组');
      return false;
    }
    
    // 获取当前时间
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 获取当前观看人数
    const viewers = liveRoomInfo.value.viewers;
    if (!viewers) {
      console.error('暂无直播间观看人数数据');
      return false;
    }
    
    console.log(`开始播报: 当前时间 ${hour}:${minute}，观看人数 ${viewers}`);
    
    // 播放时间音频
    const timeResult = await ipc.invoke(ipcApiRoute.voiceAssistant.playBroadcast, {
      type: 'time',
      hour,
      minute,
      timeGroupPath: randomBroadcastSettings.value.timeGroupPath,
      deviceId: selectedAudioDevice.value,
      playbackRate: audioSettings.value.playbackRate
    });
    
    if (!timeResult || timeResult.status !== 'success') {
      console.error('播放报时音频失败:', timeResult?.message);
      return false;
    }
    
    // 报时音频播放完成后，播放人数音频
    const viewerResult = await ipc.invoke(ipcApiRoute.voiceAssistant.playBroadcast, {
      type: 'viewers',
      viewers,
      viewerGroupPath: randomBroadcastSettings.value.viewerGroupPath,
      deviceId: selectedAudioDevice.value,
      playbackRate: audioSettings.value.playbackRate
    });
    
    if (!viewerResult || viewerResult.status !== 'success') {
      console.error('播放人数音频失败:', viewerResult?.message);
      return false;
    }
    
    // 更新上次播报时间和计算下次播报时间
    randomBroadcastSettings.value.lastBroadcastTime = Date.now();
    
    // 生成随机间隔时间
    const minInterval = randomBroadcastSettings.value.minInterval;
    const maxInterval = randomBroadcastSettings.value.maxInterval;
    const randomInterval = Math.floor(minInterval + Math.random() * (maxInterval - minInterval));
    
    randomBroadcastSettings.value.nextBroadcastTime = Date.now() + (randomInterval * 1000);
    console.log(`插播完成，下次插播将在${randomInterval}秒后`);
    
    return true;
  } catch (error) {
    console.error('播放插播出错:', error);
    return false;
  }
};

// 检查是否应该进行插播
const shouldBroadcast = () => {
  // 如果未启用插播，直接返回false
  if (!randomBroadcastSettings.value.enabled) return false;
  
  // 如果尚未设置下次播报时间，立即设置
  if (!randomBroadcastSettings.value.nextBroadcastTime) {
    // 生成随机间隔时间
    const minInterval = randomBroadcastSettings.value.minInterval;
    const maxInterval = randomBroadcastSettings.value.maxInterval;
    const randomInterval = Math.floor(minInterval + Math.random() * (maxInterval - minInterval));
    
    randomBroadcastSettings.value.nextBroadcastTime = Date.now() + (randomInterval * 1000);
    return false;
  }
  
  // 如果还未到下次播报时间，返回false
  if (Date.now() < randomBroadcastSettings.value.nextBroadcastTime) {
    return false;
  }
  
  // 根据概率判断是否播报
  const probability = randomBroadcastSettings.value.probability;
  const random = Math.random() * 100;
  
  return random <= probability;
};

// 保存随机插播设置
const saveRandomBroadcastSettings = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'set',
      table: 'settings',
      key: 'randomBroadcast',
      value: {
        enabled: randomBroadcastSettings.value.enabled,
        minInterval: randomBroadcastSettings.value.minInterval,
        maxInterval: randomBroadcastSettings.value.maxInterval,
        probability: randomBroadcastSettings.value.probability,
        timeGroupPath: randomBroadcastSettings.value.timeGroupPath,
        viewerGroupPath: randomBroadcastSettings.value.viewerGroupPath,
        timestamp: new Date().getTime()
      }
    });

    if (result && result.status === 'success') {
      console.log('随机插播设置已保存');
    } else {
      console.error('保存随机插播设置失败:', result?.message);
    }
  } catch (error) {
    console.error('保存随机插播设置出错:', error);
  }
};

// 加载随机插播设置
const loadRandomBroadcastSettings = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'get',
      table: 'settings',
      key: 'randomBroadcast'
    });

    if (result && result.status === 'success' && result.data) {
      const savedSettings = result.data;
      // 合并保存的设置，保留默认值作为备选
      randomBroadcastSettings.value = {
        ...randomBroadcastSettings.value,
        ...savedSettings
      };
      console.log('已加载随机插播设置:', randomBroadcastSettings.value);
    }
  } catch (error) {
    console.error('加载随机插播设置出错:', error);
  }
};

// 监听随机插播设置变化，保存设置
watch([
  () => randomBroadcastSettings.value.enabled,
  () => randomBroadcastSettings.value.minInterval,
  () => randomBroadcastSettings.value.maxInterval,
  () => randomBroadcastSettings.value.probability,
  () => randomBroadcastSettings.value.timeGroupPath,
  () => randomBroadcastSettings.value.viewerGroupPath
], debounce(() => {
  saveRandomBroadcastSettings();
}, 500));

// 监听随机插播启用状态变化
watch(() => randomBroadcastSettings.value.enabled, (newValue) => {
  if (newValue) {
    // 加载时间和人数音频组
    loadBroadcastGroups();
  }
});

// 组件挂载时
onMounted(async () => {
  // 如果存在共享状态，同步到当前组件
  if (sharedState) {
    connected.value = sharedState.connected;
    roomId.value = sharedState.roomId;
  } else {
    // 否则使用Pinia Store中的状态
    connected.value = livechatStore.connected;
    roomId.value = livechatStore.roomId;
  }

  // 初始化
  await getPythonBaseUrl(); // 先获取Python服务地址
  // 尝试加载保存的设备设置
  await loadDeviceSetting();
  await getAudioDevices(); // 获取音频设备
  // 加载保存的音频设置
  await loadAudioSettings();
  await getAudioGroups();
  if (selectedAudioGroup.value) {
    await getSubFolders(selectedAudioGroup.value);
  }
  await checkVoiceAssistantStatus();

  // 加载随机插播设置 - 确保在loadBroadcastGroups之前加载
  await loadRandomBroadcastSettings();
  
  // 如果随机插播已启用，加载时间和人数音频组
  if (randomBroadcastSettings.value.enabled) {
    await loadBroadcastGroups();
  }
  
  // 设置直播间监听器
  setupLiveRoomListener();
});

// 组件卸载前
onBeforeUnmount(() => {
  // 清除播放定时器
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  
  // 如果正在播放，停止播放
  if (isVoiceEnabled.value) {
    disableVoiceAssistant();
  } else {
    stopAudioPlayback();
  }
});
</script>

<style lang="less" scoped>
.auto-text-reply-container {
  padding: 5px 10px;

  .main-content {
    display: flex;
    margin-bottom: 10px;
    gap: 12px;
    height: 420px;
    min-width: 600px; /* 确保有最小宽度 */
    overflow-x: auto; /* 当宽度小于最小宽度时允许水平滚动 */

    .left-panel, .right-panel {
      border: 1px solid #e4e7ed;
      border-radius: 3px;
      background-color: #fff;
    }

    .left-panel {
      width: 28%;
      min-width: 200px; /* 确保左面板有最小宽度 */
      max-width: 300px; /* 限制最大宽度 */
      overflow: auto; /* 允许滚动 */
      padding: 8px;

      .panel-section {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .setting-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .setting-label {
            width: 80px;
            color: #606266;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 0;
            white-space: nowrap;
          }

          .time-inputs {
            display: flex;
            align-items: center;
            flex: 1;

            :deep(.el-input) {
              width: 60px;
              height: 24px;
              text-align: center;
            }

            .separator {
              margin: 0 5px;
              color: #606266;
            }

            .unit {
              margin: 0 3px;
              font-size: 12px;
              color: #606266;
            }
          }

          .voice-slider {
            display: flex;
            align-items: center;
            flex: 1;

            :deep(.el-slider) {
              flex: 1;
              margin-right: 10px;
            }

            .slider-value {
              min-width: 40px;
              font-size: 12px;
              color: #606266;
            }
          }

          .play-mode {
            flex: 1;

            :deep(.el-radio-group) {
              width: 100%;
              display: flex;
              justify-content: space-between;

              .el-radio {
                margin-right: 0;
                font-size: 12px;
              }
            }
          }

          .device-selector {
            flex: 1;
            display: flex;
            align-items: center;

            :deep(.el-select) {
              flex: 1;
              margin-right: 5px;
            }
          }
        }
      }

      .tips-box {
        background-color: #fdf6ec;
        border: 1px solid #faecd8;
        border-radius: 2px;
        padding: 4px 8px;
        margin: 8px 0;
        text-align: left;

        .tip-line {
          color: #e6a23c;
          font-size: 11px;
          line-height: 1.4;
          text-align: left;
        }
      }

      .control-button {
        margin-top: 4px;
        width: 100%;
        height: 26px;
        font-size: 12px;
        padding: 3px 8px;
      }
    }

    .right-panel {
      flex: 1;
      min-width: 350px; /* 确保右面板有最小宽度 */
      overflow: hidden; /* 隐藏溢出内容 */
      padding: 8px;
      display: flex;
      flex-direction: column;

      .panel-section {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;

        // 表格上方的操作区域样式
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .left-controls {
            display: flex;
            align-items: center;

            .group-selector {
              display: flex;
              align-items: center;

              .selector-label {
                margin-right: 5px;
                font-size: 12px;
                white-space: nowrap;
              }

              .group-select {
                width: 150px;
              }

              .refresh-btn {
                margin-left: 5px;
                padding: 3px 6px;
              }

              .folder-btn {
                margin-left: 5px;
                padding: 3px 6px;
              }
            }
          }
        }

        .el-table {
          // 允许表格内容滚动
          .el-table__body-wrapper {
            overflow-x: auto;
          }
        }

        .file-name {
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.select-with-button {
  display: flex;
  align-items: center;
  width: 100%;
}

.group-select {
  flex: 1;
}

.refresh-btn {
  padding: 2px 6px;
  line-height: 1;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.broadcast-settings {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px dashed #e6a23c;
  border-radius: 4px;
  background-color: #fdf6ec;
}

.broadcast-group-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    
    .setting-label {
      width: 80px;
      color: #606266;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 0;
      white-space: nowrap;
    }
    
    .time-group-select {
      flex: 1;
      display: flex;
      align-items: center;
      
      .el-select {
        flex: 1;
      }
      
      .refresh-btn {
        margin-left: 5px;
      }
    }
  }
}

.probability-slider {
  display: flex;
  align-items: center;
  flex: 1;
  
  .el-slider {
    flex: 1;
    margin-right: 10px;
  }
  
  .slider-value {
    min-width: 40px;
    font-size: 12px;
    color: #606266;
  }
}
</style>
