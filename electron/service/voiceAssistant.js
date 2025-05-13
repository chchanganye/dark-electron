/**
 * 语音助手服务
 */
'use strict';

const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { logger } = require('ee-core/log');
const { getMainWindow } = require('ee-core/electron');
const { getDataDir, getExtraResourcesDir } = require('ee-core/ps');
const { spawn, exec, execSync } = require('child_process');
// 改为动态导入方式
const getMusicMetadata = async () => {
    try {
        return await import('music-metadata');
    } catch (error) {
        logger.error(`导入 music-metadata 失败: ${error.message}`);
        throw error;
    }
};

// 将fs操作转换为Promise版本
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * 语音助手服务
 * @class
 */
class VoiceAssistantService {
    constructor() {
        this.isEnabled = false;
        this.audioFolder = path.join(getExtraResourcesDir(), 'audio');
        this.audioGroups = [];
        this.currentAudioGroup = '';
        this.audioFiles = [];
        this.playTimer = null;
        this.currentIndex = 0;
        this.settings = {
            volume: 80,
            playbackRate: 1.0,
            minInterval: 5,
            maxInterval: 10,
            playMode: 'random',
            deviceId: '' // 存储选中的设备ID
        };
        this.lastPlayTime = 0;
        // 记录所有活跃的播放进程
        this.activeProcesses = [];
        this.audioProcess = null;
        this.isPlaying = false;

        // 确保音频文件夹存在
        this.ensureAudioFolderExists();

        // 在应用退出时清理
        app.on('will-quit', () => {
            this.cleanupAllProcesses();
        });
    }

    /**
     * 确保音频文件夹存在
     */
    ensureAudioFolderExists() {
        try {
            if (!fs.existsSync(this.audioFolder)) {
                fs.mkdirSync(this.audioFolder, { recursive: true });
                logger.info(`创建音频文件夹: ${this.audioFolder}`);

                // 创建一个示例音频组
                const exampleGroup = '示例音频';
                const groupPath = path.join(this.audioFolder, exampleGroup);
                if (!fs.existsSync(groupPath)) {
                    fs.mkdirSync(groupPath, { recursive: true });
                    logger.info(`创建示例音频组文件夹: ${groupPath}`);
                }
            }
        } catch (error) {
            logger.error(`创建音频文件夹失败: ${error.message}`);
        }
    }

    /**
     * 获取音频组列表
     * @returns {Promise<Array>} - 音频组列表
     */
    async getAudioGroups() {
        try {
            const entries = await readdir(this.audioFolder, { withFileTypes: true });
            const folders = entries
                .filter(entry => entry.isDirectory())
                .map(dir => dir.name);

            this.audioGroups = folders;
            logger.info(`获取到音频组列表: ${folders.join(', ')}`);
            return folders;
        } catch (error) {
            logger.error(`获取音频组列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取音频组中的音频文件
     * @param {string} groupName - 音频组名称
     * @returns {Promise<Array>} - 音频文件列表
     */
    async getAudioFiles(groupName) {
        try {
            const groupPath = path.join(this.audioFolder, groupName);
            if (!fs.existsSync(groupPath)) {
                logger.error(`音频组文件夹不存在: ${groupPath}`);
                return [];
            }

            const entries = await readdir(groupPath);
            const audioFiles = [];

            for (const entry of entries) {
                const filePath = path.join(groupPath, entry);
                const stats = await stat(filePath);

                if (stats.isFile() && this.isAudioFile(entry)) {
                    audioFiles.push({
                        name: entry,
                        path: filePath,
                        size: stats.size,
                        modifiedTime: stats.mtime
                    });
                }
            }

            logger.info(`获取到音频组 "${groupName}" 中的音频文件: ${audioFiles.length} 个`);
            return audioFiles;
        } catch (error) {
            logger.error(`获取音频文件列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 判断文件是否为音频文件
     * @param {string} filename - 文件名
     * @returns {boolean} - 是否为音频文件
     */
    isAudioFile(filename) {
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
        const ext = path.extname(filename).toLowerCase();
        return audioExtensions.includes(ext);
    }

    /**
     * 获取音频组中的子文件夹
     * @param {string} groupName - 音频组名称
     * @returns {Promise<Array>} - 子文件夹列表，包含名称和音频文件数量
     */
    async getSubFolders(groupName) {
        try {
            const groupPath = path.join(this.audioFolder, groupName);
            if (!fs.existsSync(groupPath)) {
                logger.error(`音频组文件夹不存在: ${groupPath}`);
                return [];
            }

            const entries = await readdir(groupPath, { withFileTypes: true });
            const subFolders = [];

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const folderPath = path.join(groupPath, entry.name);
                    // 获取该子文件夹中的音频文件数量
                    const audioFiles = await this.getAudioFilesInFolder(folderPath);

                    subFolders.push({
                        name: entry.name,
                        path: folderPath,
                        audioCount: audioFiles.length
                    });
                }
            }

            logger.info(`获取到音频组 "${groupName}" 中的子文件夹: ${subFolders.length} 个`);
            return subFolders;
        } catch (error) {
            logger.error(`获取子文件夹列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取指定文件夹中的音频文件
     * @param {string} folderPath - 文件夹路径
     * @returns {Promise<Array>} - 音频文件列表
     */
    async getAudioFilesInFolder(folderPath) {
        try {
            if (!fs.existsSync(folderPath)) {
                logger.error(`文件夹不存在: ${folderPath}`);
                return [];
            }

            const entries = await readdir(folderPath);
            const audioFiles = [];

            for (const entry of entries) {
                const filePath = path.join(folderPath, entry);
                const stats = await stat(filePath);

                if (stats.isFile() && this.isAudioFile(entry)) {
                    audioFiles.push({
                        name: entry,
                        path: filePath,
                        size: stats.size,
                        modifiedTime: stats.mtime
                    });
                }
            }

            return audioFiles;
        } catch (error) {
            logger.error(`获取音频文件列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 以新模式启动语音助手（由前端控制播放频率）
     * @param {string} groupName - 音频组名称
     * @param {Object} settings - 语音助手设置
     * @returns {boolean} - 操作结果
     */
    async startNewPlayMode(groupName, settings = {}) {
        try {
            // 停止当前可能在播放的音频
            this.isEnabled = false;
            
            // 尝试停止任何正在播放的音频
            await this.playSingleAudio('stop');
            
            // 保存当前状态
            this.isEnabled = true;
            this.currentAudioGroup = groupName;
            this.settings = { ...this.settings, ...settings };
            
            // 发送日志
            logger.info(`启动语音助手，使用音频组: ${groupName}`);
            this.sendVoiceAssistantLog(`语音助手已启动，使用音频组: ${groupName}`);
            
            return true;
        } catch (error) {
            logger.error(`启动语音助手失败: ${error.message}`);
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * 发送语音助手日志消息
     * @param {string} message - 日志消息
     */
    sendVoiceAssistantLog(message) {
        try {
            const win = getMainWindow();
            if (win && !win.isDestroyed()) {
                win.webContents.send('livechat-message', {
                    type: 'voice_assistant',
                    message: message
                });
            }
        } catch (error) {
            logger.error(`发送语音助手日志失败: ${error.message}`);
        }
    }

    /**
     * 播放指定子文件夹中的随机音频
     * @param {string} subFolderPath - 子文件夹路径（相对于主音频组）
     * @returns {Object} - 包含播放状态和音频信息的结果对象
     */
    async playSubFolderAudio(subFolderPath) {
        try {
            // 构建完整的文件夹路径
            const fullPath = path.join(this.audioFolder, subFolderPath);
            
            // 检查路径是否存在
            if (!fs.existsSync(fullPath)) {
                return { code: 1, message: `子文件夹不存在: ${subFolderPath}` };
            }
            
            // 获取该文件夹中的所有音频文件
            const files = await this.getAudioFilesInFolder(fullPath);
            if (!files || files.length === 0) {
                return { code: 1, message: `子文件夹中没有音频文件: ${subFolderPath}` };
            }
            
            // 随机选择一个音频文件
            const randomIndex = Math.floor(Math.random() * files.length);
            const selectedFile = files[randomIndex];
            
            // 播放选中的文件
            const result = await this.playSingleAudio(selectedFile.path, {
                volume: (this.settings.volume || 80) / 100,
                playbackRate: this.settings.playbackRate || 1.0,
                deviceId: this.settings.deviceId || ''
            });
            
            if (result) {
                // 获取音频时长
                const durationResult = await this.getAudioDuration(selectedFile.path);
                const duration = durationResult.code === 0 ? durationResult.data.duration : 0;
                
                // 记录并发送日志
                logger.info(`正在播放: ${selectedFile.path}`);
                this.sendVoiceAssistantLog(`正在播放音频文件: ${selectedFile.path}`);
                
                return { 
                    code: 0, 
                    message: '开始播放音频',
                    data: {
                        file: selectedFile,
                        duration: duration,
                        actualDuration: duration / (this.settings.playbackRate || 1.0)
                    }
                };
            } else {
                return { code: 1, message: '播放音频失败' };
            }
        } catch (error) {
            logger.error(`播放子文件夹音频失败: ${error.message}`);
            return { code: 1, message: `播放失败: ${error.message}` };
        }
    }

    /**
     * 停止语音助手
     * @returns {Promise<boolean>} - 是否成功停止
     */
    async stop() {
        try {
            if (this.playTimer) {
                clearTimeout(this.playTimer);
                this.playTimer = null;
            }

            this.isEnabled = false;
            logger.info('已停止语音助手');
            return true;
        } catch (error) {
            logger.error(`停止语音助手失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取服务状态
     * @returns {Object} - 服务状态
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            currentGroup: this.currentAudioGroup,
            fileCount: this.audioFiles.length,
            settings: this.settings,
            lastPlayTime: this.lastPlayTime
        };
    }

    /**
     * 更新音频输出设备
     * @param {string} deviceId - 设备ID
     * @returns {boolean} - 是否成功更新
     */
    updateAudioDevice(deviceId) {
        try {
            this.settings.deviceId = deviceId;
            logger.info(`已更新音频输出设备: ${deviceId}`);
            return true;
        } catch (error) {
            logger.error(`更新音频设备失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 播放单个音频文件
     * @param {string} filePath - 文件路径
     * @param {Object} options - 播放选项
     * @param {number} options.volume - 音量 (0-1)
     * @param {number} options.playbackRate - 播放速率
     * @param {string} options.deviceId - 设备ID
     * @returns {boolean} - 是否成功开始播放
     */
    async playSingleAudio(filePath, options = {}) {
        try {
            const { volume = 0.8, playbackRate = 1.0, deviceId = '' } = options;
            const axios = require('axios');
            const { pythonServer } = require('./PythonServer');
            const baseUrl = pythonServer.getPythonBaseUrl2();

            if (!baseUrl) {
                logger.error('无法获取Python服务地址');
                return false;
            }

            // 特殊情况：停止命令
            if (filePath === 'stop') {
                try {
                    await axios.post(`${baseUrl}/api/stop`);
                    logger.info('停止音频播放');
                    return true;
                } catch (error) {
                    logger.error(`停止音频播放失败: ${error.message}`);
                    return false;
                }
            }

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                logger.error(`音频文件不存在: ${filePath}`);
                return false;
            }

            // 检查文件是否为音频文件
            if (!this.isAudioFile(filePath)) {
                logger.error(`文件不是支持的音频格式: ${filePath}`);
                return false;
            }

            logger.info(`准备播放音频文件: ${filePath}`);

            // 使用 Python API 播放音频
            const response = await axios.post(`${baseUrl}/api/play`, {
                file_path: filePath,
                device_id: deviceId,
                playback_speed: playbackRate,
                volume: volume
            });

            if (response.data && response.data.code === 0) {
                logger.info(`通过Python API播放音频成功: ${filePath}`);
                return true;
            } else {
                logger.error(`通过Python API播放音频失败: ${response.data?.message || '未知错误'}`);
                return false;
            }
        } catch (error) {
            logger.error(`播放单个音频文件出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 清理所有活跃的播放进程
     */
    cleanupAllProcesses() {
        try {
            logger.info(`清理 ${this.activeProcesses.length} 个音频播放进程`);

            for (const process of this.activeProcesses) {
                try {
                    if (!process.killed) {
                        process.kill();
                    }
                } catch (error) {
                    logger.error(`终止进程失败: ${error.message}`);
                }
            }

            // 重置数组
            this.activeProcesses = [];
        } catch (error) {
            logger.error(`清理播放进程失败: ${error.message}`);
        }
    }

    /**
     * 打开音频组文件夹
     * @param {string} groupName - 音频组名称
     * @returns {Promise<boolean>} - 是否成功打开
     */
    async openAudioGroupFolder(groupName) {
        try {
            const groupPath = path.join(this.audioFolder, groupName);

            // 检查文件夹是否存在
            if (!fs.existsSync(groupPath)) {
                logger.error(`音频组文件夹不存在: ${groupPath}`);
                return false;
            }

            // 使用系统默认程序打开文件夹
            const { shell } = require('electron');
            await shell.openPath(groupPath);

            logger.info(`已打开音频组文件夹: ${groupPath}`);
            return true;
        } catch (error) {
            logger.error(`打开音频组文件夹失败: ${error.message}`);
            return false;
        }
    }

    // 获取音频文件时长
    async getAudioDuration(filePath) {
        try {
            const musicMetadata = await getMusicMetadata();
            const metadata = await musicMetadata.parseFile(filePath);
            return {
                code: 0,
                data: {
                    duration: metadata.format.duration
                }
            };
        } catch (error) {
            console.error('获取音频时长失败:', error);
            return {
                code: 1,
                message: '获取音频时长失败: ' + error.message
            };
        }
    }

    /**
     * 获取报时和人数音频组
     * @returns {Object} 报时和人数音频组
     */
    async getBroadcastGroups() {
        try {
            const broadcastDir = path.join(this.audioFolder, '报时及人数录音');
            const result = {
                timeGroups: [],
                viewerGroups: []
            };

            // 检查目录是否存在
            if (!fs.existsSync(broadcastDir)) {
                return result;
            }

            // 获取时间组
            const timeDir = path.join(broadcastDir, '时间组');
            if (fs.existsSync(timeDir)) {
                const timeDirs = await readdir(timeDir);
                for (const dir of timeDirs) {
                    const dirPath = path.join(timeDir, dir);
                    const stats = await stat(dirPath);
                    if (stats.isDirectory()) {
                        result.timeGroups.push({
                            name: dir,
                            path: path.join('报时及人数录音', '时间组', dir)
                        });
                    }
                }
            }

            // 获取人数组
            const viewerDir = path.join(broadcastDir, '人数组');
            if (fs.existsSync(viewerDir)) {
                const viewerDirs = await readdir(viewerDir);
                for (const dir of viewerDirs) {
                    const dirPath = path.join(viewerDir, dir);
                    const stats = await stat(dirPath);
                    if (stats.isDirectory()) {
                        result.viewerGroups.push({
                            name: dir,
                            path: path.join('报时及人数录音', '人数组', dir)
                        });
                    }
                }
            }

            return result;
        } catch (error) {
            logger.error(`获取报时和人数音频组失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 播放时间插播
     * @param {number} hour - 小时数
     * @param {number} minute - 分钟数
     * @param {string} timeGroupPath - 时间音频组路径
     * @param {string} deviceId - 设备ID
     * @param {number} playbackRate - 播放速度
     * @returns {boolean} 是否成功
     */
    async playTimeBroadcast(hour, minute, timeGroupPath, deviceId, playbackRate) {
        try {
            const fullPath = path.join(this.audioFolder, timeGroupPath);
            
            // 检查目录是否存在
            if (!fs.existsSync(fullPath)) {
                logger.error(`时间音频组路径不存在: ${fullPath}`);
                return false;
            }
            
            // 获取时和分文件夹
            const hourDir = path.join(fullPath, '时');
            const minuteDir = path.join(fullPath, '分');
            
            if (!fs.existsSync(hourDir) || !fs.existsSync(minuteDir)) {
                logger.error(`时间音频组缺少时或分文件夹: ${fullPath}`);
                return false;
            }
            
            // 获取对应的音频文件
            const hourFile = path.join(hourDir, `${hour}.mp3`);
            const minuteFile = path.join(minuteDir, `${minute}.mp3`);
            
            // 检查文件是否存在，不存在则使用默认值或返回失败
            if (!fs.existsSync(hourFile)) {
                logger.error(`小时音频文件不存在: ${hourFile}`);
                return false;
            }
            
            if (!fs.existsSync(minuteFile)) {
                logger.error(`分钟音频文件不存在: ${minuteFile}`);
                return false;
            }
            
            // 播放小时音频
            logger.info(`播放小时音频: ${hourFile}`);
            await this.playAudioAndWait(hourFile, deviceId, playbackRate);
            
            // 播放分钟音频
            logger.info(`播放分钟音频: ${minuteFile}`);
            await this.playAudioAndWait(minuteFile, deviceId, playbackRate);
            
            return true;
        } catch (error) {
            logger.error(`播放时间插播失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 播放音频并等待播放完成
     * @param {string} filePath - 音频文件路径
     * @param {string} deviceId - 设备ID
     * @param {number} playbackRate - 播放速度
     * @returns {Promise} 播放完成的Promise
     */
    async playAudioAndWait(filePath, deviceId, playbackRate) {
        return new Promise((resolve, reject) => {
            try {
                // 使用播放音频的方法
                this.playSingleAudio(filePath, {
                    volume: 0.8,
                    playbackRate: playbackRate || 1.0,
                    deviceId: deviceId || ''
                });
                
                // 获取音频时长
                const getAudioDuration = () => {
                    try {
                        // 使用ffprobe获取音频时长
                        const ffprobe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
                        const duration = parseFloat(ffprobe.toString().trim());
                        return duration;
                    } catch (error) {
                        logger.error(`获取音频时长失败: ${error.message}`);
                        // 默认返回3秒
                        return 3;
                    }
                };
                
                // 计算等待时间 (考虑播放速度)
                const duration = getAudioDuration();
                const waitTime = (duration / (playbackRate || 1.0)) * 1000;
                
                // 等待音频播放完成
                setTimeout(() => {
                    resolve();
                }, waitTime + 500); // 额外增加500ms的缓冲时间
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 播放人数插播
     * @param {number} viewers - 观看人数
     * @param {string} viewerGroupPath - 人数音频组路径
     * @param {string} deviceId - 设备ID
     * @param {number} playbackRate - 播放速度
     * @returns {boolean} 是否成功
     */
    async playViewersBroadcast(viewers, viewerGroupPath, deviceId, playbackRate) {
        try {
            const fullPath = path.join(this.audioFolder, viewerGroupPath);
            
            // 检查目录是否存在
            if (!fs.existsSync(fullPath)) {
                logger.error(`人数音频组路径不存在: ${fullPath}`);
                return false;
            }
            
            // 获取人数文件夹
            const viewerDir = path.join(fullPath, '人数');
            
            if (!fs.existsSync(viewerDir)) {
                logger.error(`人数文件夹不存在: ${viewerDir}`);
                return false;
            }
            
            // 获取对应的音频文件
            const viewerFile = path.join(viewerDir, `${viewers}.mp3`);
            
            // 检查文件是否存在，不存在则尝试查找最接近的文件
            if (!fs.existsSync(viewerFile)) {
                logger.warn(`人数音频文件不存在: ${viewerFile}，尝试查找最接近的文件`);
                
                // 获取文件夹中的所有mp3文件
                const files = await readdir(viewerDir);
                const mp3Files = files.filter(file => file.endsWith('.mp3'));
                
                if (mp3Files.length === 0) {
                    logger.error(`人数文件夹中没有mp3文件: ${viewerDir}`);
                    return false;
                }
                
                // 提取文件名中的数字并查找最接近的
                const fileNumbers = mp3Files.map(file => {
                    const num = parseInt(path.basename(file, '.mp3'));
                    return isNaN(num) ? 0 : num;
                }).filter(num => num > 0);
                
                if (fileNumbers.length === 0) {
                    logger.error(`人数文件夹中没有有效的数字命名的mp3文件: ${viewerDir}`);
                    return false;
                }
                
                // 查找最接近的数字
                let closest = fileNumbers[0];
                let minDiff = Math.abs(viewers - closest);
                
                for (let i = 1; i < fileNumbers.length; i++) {
                    const diff = Math.abs(viewers - fileNumbers[i]);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = fileNumbers[i];
                    }
                }
                
                // 使用最接近的文件
                const closestFile = path.join(viewerDir, `${closest}.mp3`);
                logger.info(`使用最接近的人数音频文件: ${closestFile}`);
                
                // 播放人数音频
                await this.playAudioAndWait(closestFile, deviceId, playbackRate);
            } else {
                // 直接播放精确匹配的文件
                logger.info(`播放人数音频: ${viewerFile}`);
                await this.playAudioAndWait(viewerFile, deviceId, playbackRate);
            }
            
            return true;
        } catch (error) {
            logger.error(`播放人数插播失败: ${error.message}`);
            return false;
        }
    }

}

// 创建单例
const voiceAssistantService = new VoiceAssistantService();

// 导出服务实例
module.exports = {
    voiceAssistantService
};