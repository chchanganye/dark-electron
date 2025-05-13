/**
 * 语音助手控制器
 */
'use strict';

const { logger } = require('ee-core/log');
const { voiceAssistantService } = require('../service/voiceAssistant');

/**
 * 语音助手控制器
 * @class
 */
class VoiceAssistantController {
    constructor() {
        // 直接使用单例
        this.voiceAssistantService = voiceAssistantService;
    }

    /**
     * 获取音频组列表
     */
    async getAudioGroups() {
        try {
            const groups = await this.voiceAssistantService.getAudioGroups();
            return this.success('获取音频组列表成功', groups);
        } catch (error) {
            logger.error(`获取音频组列表失败: ${error.message}`);
            return this.fail(`获取音频组列表失败: ${error.message}`);
        }
    }

    /**
     * 获取音频文件列表
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     */
    async getAudioFiles(args) {
        try {
            const { groupName } = args;
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            const files = await this.voiceAssistantService.getAudioFiles(groupName);
            return this.success('获取音频文件列表成功', files);
        } catch (error) {
            logger.error(`获取音频文件列表失败: ${error.message}`);
            return this.fail(`获取音频文件列表失败: ${error.message}`);
        }
    }

    /**
     * 获取音频输出设备列表
     */
    async getAudioDevices() {
        try {
            // 这个方法将来会由Python API来实现
            // 暂时返回空数组
            logger.info('获取音频设备列表功能将由Python API实现');
            return this.success('获取音频设备列表接口预留', []);
        } catch (error) {
            logger.error(`获取音频设备列表失败: ${error.message}`);
            return this.fail(`获取音频设备列表失败: ${error.message}`);
        }
    }

    /**
     * 更新音频输出设备
     * @param {Object} args - 参数
     * @param {string} args.deviceId - 设备ID
     */
    async updateAudioDevice(args) {
        try {
            const { deviceId } = args;
            if (!deviceId) {
                return this.fail('缺少必要参数: deviceId');
            }

            const result = this.voiceAssistantService.updateAudioDevice(deviceId);
            if (result) {
                return this.success('更新音频设备成功');
            } else {
                return this.fail('更新音频设备失败');
            }
        } catch (error) {
            logger.error(`更新音频设备失败: ${error.message}`);
            return this.fail(`更新音频设备失败: ${error.message}`);
        }
    }

    /**
     * 启动语音助手
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     * @param {Object} args.settings - 语音助手设置
     */
    async startVoiceAssistant(args) {
        try {
            const { groupName, settings } = args || {};
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            logger.info(`尝试启动语音助手，使用音频组: ${groupName}`);

            // 处理设置对象，确保数据类型正确
            let validSettings = null;
            if (settings) {
                validSettings = {
                    volume: typeof settings.volume === 'number' ? settings.volume : 80,
                    playbackRate: typeof settings.playbackRate === 'number' ? settings.playbackRate : 1.0,
                    minInterval: typeof settings.minInterval === 'number' ? settings.minInterval : 0,
                    maxInterval: typeof settings.maxInterval === 'number' ? settings.maxInterval : 0,
                    playMode: typeof settings.playMode === 'string' ? settings.playMode : 'random',
                    deviceId: settings.deviceId || '' // 添加设备ID
                };
                logger.info(`语音助手设置: ${JSON.stringify(validSettings)}`);
            }

            const result = await this.voiceAssistantService.start(groupName, validSettings);
            if (result) {
                return this.success('启动语音助手成功');
            } else {
                return this.fail('启动语音助手失败');
            }
        } catch (error) {
            logger.error(`启动语音助手失败: ${error.message}`);
            return this.fail(`启动语音助手失败: ${error.message}`);
        }
    }

    /**
     * 停止语音助手
     */
    async stopVoiceAssistant() {
        try {
            const result = await this.voiceAssistantService.stop();
            if (result) {
                return this.success('停止语音助手成功');
            } else {
                return this.fail('停止语音助手失败');
            }
        } catch (error) {
            logger.error(`停止语音助手失败: ${error.message}`);
            return this.fail(`停止语音助手失败: ${error.message}`);
        }
    }

    /**
     * 获取语音助手状态
     */
    async getVoiceAssistantStatus() {
        try {
            const status = this.voiceAssistantService.getStatus();
            return this.success('获取语音助手状态成功', status);
        } catch (error) {
            logger.error(`获取语音助手状态失败: ${error.message}`);
            return this.fail(`获取语音助手状态失败: ${error.message}`);
        }
    }

    /**
     * 播放单个音频文件
     * @param {Object} args - 参数
     * @param {string} args.filePath - 文件路径
     * @param {number} args.volume - 音量 (0-1)
     * @param {number} args.playbackRate - 播放速率
     * @param {string} args.deviceId - 设备ID
     * @returns {Object} - 操作结果
     */
    playAudioFile(args) {
        try {
            const { filePath, volume, playbackRate, deviceId } = args;
            if (!filePath) {
                return this.fail('缺少文件路径参数');
            }

            const fs = require('fs');
            if (!fs.existsSync(filePath)) {
                return this.fail(`文件不存在: ${filePath}`);
            }

            // 调用服务层播放音频
            const result = this.voiceAssistantService.playSingleAudio(filePath, {
                volume: volume || 0.8,
                playbackRate: playbackRate || 1.0,
                deviceId: deviceId || ''
            });

            if (result) {
                return this.success('开始播放音频');
            } else {
                return this.fail('播放音频失败');
            }
        } catch (error) {
            logger.error(`播放音频文件出错: ${error.message}`);
            return this.fail(`播放音频文件出错: ${error.message}`);
        }
    }

    /**
     * 打开音频组文件夹
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     */
    async openAudioGroupFolder(args) {
        try {
            const { groupName } = args || {};
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            logger.info(`尝试打开音频组文件夹: ${groupName}`);

            // 调用服务层打开文件夹
            const result = await this.voiceAssistantService.openAudioGroupFolder(groupName);
            if (result) {
                return this.success('打开文件夹成功');
            } else {
                return this.fail('打开文件夹失败');
            }
        } catch (error) {
            logger.error(`打开音频组文件夹失败: ${error.message}`);
            return this.fail(`打开音频组文件夹失败: ${error.message}`);
        }
    }

    /**
     * 获取音频组中的子文件夹
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     */
    async getSubFolders(args) {
        try {
            const { groupName } = args;
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            const subFolders = await this.voiceAssistantService.getSubFolders(groupName);
            return this.success('获取子文件夹列表成功', subFolders);
        } catch (error) {
            logger.error(`获取子文件夹列表失败: ${error.message}`);
            return this.fail(`获取子文件夹列表失败: ${error.message}`);
        }
    }

    /**
     * 使用新播放模式启动语音助手
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     * @param {Object} args.settings - 语音助手设置
     */
    async startNewPlayMode(args) {
        try {
            const { groupName, settings } = args || {};
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            logger.info(`尝试以新模式启动语音助手，使用音频组: ${groupName}`);

            // 处理设置对象，确保数据类型正确
            let validSettings = null;
            if (settings) {
                validSettings = {
                    volume: typeof settings.volume === 'number' ? settings.volume : 80,
                    playbackRate: typeof settings.playbackRate === 'number' ? settings.playbackRate : 1.0,
                    minInterval: typeof settings.minInterval === 'number' ? settings.minInterval : 5,
                    maxInterval: typeof settings.maxInterval === 'number' ? settings.maxInterval : 10,
                    playMode: typeof settings.playMode === 'string' ? settings.playMode : 'random',
                    deviceId: settings.deviceId || '' // 添加设备ID
                };
                logger.info(`语音助手设置: ${JSON.stringify(validSettings)}`);
            }

            const result = await this.voiceAssistantService.startNewPlayMode(groupName, validSettings);
            if (result) {
                return this.success('启动语音助手成功');
            } else {
                return this.fail('启动语音助手失败');
            }
        } catch (error) {
            logger.error(`启动语音助手失败: ${error.message}`);
            return this.fail(`启动语音助手失败: ${error.message}`);
        }
    }

    /**
     * 播放指定子文件夹中的随机音频
     * @param {Object} args - 参数
     * @param {string} args.subFolderPath - 子文件夹路径（相对于主音频组）
     * @returns {Object} - 操作结果
     */
    async playSubFolderAudio(args) {
        try {
            const { subFolderPath } = args || {};
            if (!subFolderPath) {
                return this.fail('缺少必要参数: subFolderPath');
            }

            logger.info(`尝试播放子文件夹音频: ${subFolderPath}`);
            const result = await this.voiceAssistantService.playSubFolderAudio(subFolderPath);

            if (result.code === 200) {
                return this.success('开始播放音频', result.data);
            } else {
                return this.fail(result.message);
            }
        } catch (error) {
            logger.error(`播放子文件夹音频失败: ${error.message}`);
            return this.fail(`播放子文件夹音频失败: ${error.message}`);
        }
    }

    /**
     * 获取音频文件时长
     * @param {Object} args - 参数对象
     * @param {string} args.filePath - 文件路径
     * @returns {Object} - 响应对象
     */
    async getDuration(args) {
        try {
            const { filePath } = args;
            if (!filePath) {
                return this.fail('文件路径不能为空');
            }

            const result = await this.voiceAssistantService.getAudioDuration(filePath);
            if (result.code === 200) {
                return this.success('获取音频时长成功', result.data);
            } else {
                return this.fail(result.message);
            }
        } catch (error) {
            logger.error('获取音频时长失败:', error);
            return this.fail('获取音频时长失败: ' + error.message);
        }
    }

    /**
     * 获取报时和人数音频组
     */
    async getBroadcastGroups() {
        try {
            const result = await this.voiceAssistantService.getBroadcastGroups();
            return this.success('获取报时和人数音频组成功', result);
        } catch (error) {
            logger.error(`获取报时和人数音频组失败: ${error.message}`);
            return this.fail(`获取报时和人数音频组失败: ${error.message}`);
        }
    }

    /**
     * 播放插播音频
     * @param {Object} args - 参数
     * @param {string} args.type - 插播类型：time(时间) 或 viewers(人数)
     * @param {number} args.hour - 小时数（仅type=time时使用）
     * @param {number} args.minute - 分钟数（仅type=time时使用）
     * @param {number} args.viewers - 观看人数（仅type=viewers时使用）
     * @param {string} args.folder - 选定的文件夹名
     * @param {string} args.deviceId - 设备ID
     * @param {number} args.playbackRate - 播放速度
     */
    async playBroadcast(args) {
        try {
            const { type, hour, minute, viewers, folder, deviceId, playbackRate } = args || {};
            if (!type) {
                return this.fail('缺少必要参数: type');
            }
            if (!folder) {
                return this.fail('缺少必要参数: folder');
            }
            if (type === 'time') {
                if (hour === undefined || minute === undefined) {
                    return this.fail('播放时间插播需要提供hour和minute参数');
                }
                const result = await this.voiceAssistantService.playTimeBroadcast(hour, minute, folder, deviceId, playbackRate);
                if (result) {
                    return this.success('播放时间插播成功');
                } else {
                    return this.fail('播放时间插播失败');
                }
            } else if (type === 'viewers') {
                if (viewers === undefined) {
                    return this.fail('播放人数插播需要提供viewers参数');
                }
                const result = await this.voiceAssistantService.playViewersBroadcast(viewers, folder, deviceId, playbackRate);
                if (result) {
                    return this.success('播放人数插播成功');
                } else {
                    return this.fail('播放人数插播失败');
                }
            } else {
                return this.fail(`不支持的插播类型: ${type}`);
            }
        } catch (error) {
            logger.error(`播放插播音频失败: ${error.message}`);
            return this.fail(`播放插播音频失败: ${error.message}`);
        }
    }

    /**
     * 成功响应
     * @param {string} message - 消息
     * @param {*} data - 数据
     * @returns {Object} - 响应对象
     */
    success(message, data = null) {
        return {
            status: 'success',
            message,
            data
        };
    }

    /**
     * 失败响应
     * @param {string} message - 消息
     * @returns {Object} - 响应对象
     */
    fail(message) {
        return {
            status: 'error',
            message
        };
    }
}

VoiceAssistantController.toString = () => '[class VoiceAssistantController]';
module.exports = VoiceAssistantController;