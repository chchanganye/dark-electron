import { logger } from 'ee-core/log';
import axios from 'axios';
import { getMainWindow } from 'ee-core/electron';
import { BasedbService } from './database/basedb';
import { type Database, type SqliteStorage } from 'ee-core/storage';

interface User {
  uid: string;
  nickname?: string;
  user_age?: number;
  gender?: number;
  followers?: number;
  following?: number;
  sec_uid?: string;
}

interface UserOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface SearchParams {
  keyword: string;
  targetUserCount?: number;
  sortType?: number;
  publishTime?: number;
  filterDuration?: string | number;
}

interface VideoSearchResult {
  success: boolean;
  data?: any;
  error?: string;
  errorDetail?: any;
  message?: string;
  responseData?: any;
}

interface UserInfoResult {
  success: boolean;
  userData?: User;
  error?: string;
  dbError?: string;
  message?: string;
  responseData?: any;
  errorDetail?: any;
}

/**
 * 用户数据服务
 * @class
 */
class UserdbService extends BasedbService {

    private userTableName: string;
    declare db: Database;
    declare storage: SqliteStorage;

    constructor() {
        super({
            dbname: 'douyin-user.db'
        });
        this.userTableName = 'user';
        this._initTable();
        this._initVideoTable();  // 初始化视频表
    }

    /**
     * 初始化用户表
     * @private
     */
    private _initTable(): void {
        this._init();

        // 检查表是否存在
        const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
        const tableExists = masterStmt.get('table', this.userTableName);
        if (!tableExists) {
            // 创建表
            const createUserTableSql = `
                CREATE TABLE ${this.userTableName} (
                    uid TEXT PRIMARY KEY,
                    nickname TEXT,
                    user_age INTEGER,
                    gender INTEGER,
                    followers INTEGER,
                    following INTEGER,
                    sec_uid TEXT
                );`;
            this.db.exec(createUserTableSql);
        }
    }

    /**
     * 添加用户
     * @param {Object} user - 用户信息
     * @returns {Object} 结果
     */
    async addUser(user: User): Promise<boolean> {
        try {
            const insert = this.db.prepare(
                `INSERT OR REPLACE INTO ${this.userTableName} 
                (uid, nickname, user_age, gender, followers, following, sec_uid) 
                VALUES (@uid, @nickname, @user_age, @gender, @followers, @following, @sec_uid)`
            );
            insert.run(user);
            return true;
        } catch (error: any) {
            console.error('Error adding user:', error);
            return false;
        }
    }

    /**
     * 获取用户
     * @param {string} uid - 用户ID
     * @returns {Promise<User | null>} 用户信息或null
     */
    async getUser(uid: string): Promise<User | null> {
        try {
            const selectUser = this.db.prepare(`SELECT * FROM ${this.userTableName} WHERE uid = ?`);
            const user = selectUser.get(uid) as User | undefined;
            return user || null;
        } catch (error: any) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    /**
     * 更新用户
     * @param {Partial<User> & { uid: string }} user - 用户部分信息和用户ID
     * @returns {Promise<boolean>} 是否成功
     */
    async updateUser(user: Partial<User> & { uid: string }): Promise<boolean> {
        try {
            const fields = Object.keys(user).filter(key => key !== 'uid');
            if (fields.length === 0) return false;

            const setClause = fields.map(field => `${field} = @${field}`).join(', ');
            const updateUser = this.db.prepare(
                `UPDATE ${this.userTableName} SET ${setClause} WHERE uid = @uid`
            );
            updateUser.run(user);
            return true;
        } catch (error: any) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    /**
     * 删除用户
     * @param {string} uid - 用户ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteUser(uid: string): Promise<boolean> {
        try {
            const deleteUser = this.db.prepare(`DELETE FROM ${this.userTableName} WHERE uid = ?`);
            deleteUser.run(uid);
            return true;
        } catch (error: any) {
            console.error('Error deleting user:', error);
            return false;
        }
    }

    /**
     * 搜索用户
     * @param {SearchParams} params - 搜索参数
     * @returns {Promise<User[]>} 匹配的用户列表
     */
    async searchUsers(params: SearchParams): Promise<User[]> {
        try {
            let query = `SELECT * FROM ${this.userTableName} WHERE 1=1`;
            const queryParams: any = {};

            if (params.keyword) {
                query += ` AND (nickname LIKE @keyword OR uid LIKE @keyword)`;
                queryParams.keyword = `%${params.keyword}%`;
            }

            const stmt = this.db.prepare(query);
            return stmt.all(queryParams) as User[];
        } catch (error: any) {
            console.error('Error searching users:', error);
            return [];
        }
    }

    /**
     * 获取所有用户
     * @param {UserOptions} options - 用户选项
     * @returns {Promise<User[]>} 用户列表
     */
    async getAllUsers(options: UserOptions = {}): Promise<User[]> {
        try {
            const { page = 1, pageSize = 10, sortBy = 'uid', sortOrder = 'ASC' } = options;
            const offset = (page - 1) * pageSize;

            const query = `
                SELECT * FROM ${this.userTableName}
                ORDER BY ${sortBy} ${sortOrder}
                LIMIT @limit OFFSET @offset
            `;

            const stmt = this.db.prepare(query);
            return stmt.all({ limit: pageSize, offset }) as User[];
        } catch (error: any) {
            console.error('Error getting all users:', error);
            return [];
        }
    }

    /**
     * 获取用户数量
     * @returns {Promise<number>} 用户数量
     */
    async getUserCount(): Promise<number> {
        try {
            const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.userTableName}`);
            const result = stmt.get() as { count: number };
            return result.count;
        } catch (error: any) {
            console.error('Error getting user count:', error);
            return 0;
        }
    }

    /**
     * 获取用户信息
     * @param {string} uid - 用户ID
     * @returns {Promise<UserInfoResult>} 用户信息结果
     */
    async getUserInfo(uid: string): Promise<UserInfoResult> {
        try {
            const user = await this.getUser(uid);
            if (user) {
                return {
                    success: true,
                    userData: user
                };
            } else {
                return {
                    success: false,
                    error: '用户不存在'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: '获取用户信息失败',
                dbError: error.message
            };
        }
    }

    /**
     * 通过关键词搜索用户
     * @param {string} keyword - 关键词
     * @returns {Promise<UserInfoResult>} 用户信息结果
     */
    async searchUsersByKeyword(keyword: string): Promise<UserInfoResult> {
        try {
            const users = await this.searchUsers({ keyword });
            if (users.length > 0) {
                return {
                    success: true,
                    userData: users[0]
                };
            } else {
                return {
                    success: false,
                    error: '未找到匹配的用户'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: '搜索用户失败',
                dbError: error.message
            };
        }
    }

    /**
     * 从抖音链接中提取UID
     * @param {string} userLink - 用户主页链接
     * @returns {Object} 结果
     */
    async extractUidFromLink(userLink: string): Promise<UserInfoResult> {
        try {
            if (!userLink) {
                return { success: false, error: '用户链接不能为空' };
            }

            logger.info('开始从链接中提取UID:', userLink);

            // 从链接中提取secUid
            let secUid = '';
            try {
                // 使用正则表达式匹配 user/ 和 ? 之间的内容
                const match = userLink.match(/\/user\/([^?]+)/);
                if (match && match[1]) {
                    secUid = match[1];
                } else {
                    return { success: false, error: '无法从链接中提取sec_uid' };
                }
            } catch (error: any) {
                logger.error('提取sec_uid失败:', error);
                return { success: false, error: '提取sec_uid失败: ' + error.message };
            }

            logger.info('提取到的secUid:', secUid);

            // 构建请求参数
            const params = {
                sec_user_id: secUid
            };

            // 构建请求头
            const headers = {
                "Authorization": "Bearer xq4uFGBJ4UQ1uxAU9GOWnmUIw1kwv4bh75Bb8Wzu6k9j0WIuXfQv7CasUw=="
            };

            // 发送请求获取用户信息
            const response = await axios.get('https://api.tikhub.io/api/v1/douyin/web/handler_user_profile_v4', {
                params,
                headers,
                timeout: 10000
            });

            // 获取响应数据
            const responseData = response.data;

            // 数据清洗与提取
            if (responseData && responseData.data) {
                logger.info('data字段结构:', JSON.stringify(Object.keys(responseData.data)));

                const userData = responseData.data.user;
                const liveUser = responseData.data.live_user;

                if (!userData) {
                    return {
                        success: false,
                        error: '响应数据中没有user信息',
                        responseData: responseData
                    };
                }

                // 提取需要的字段
                const userInfo: User = {
                    uid: userData.uid || '',
                    nickname: userData.nickname || '',
                    gender: liveUser && typeof liveUser.gender !== 'undefined' ? liveUser.gender : -1,
                    sec_uid: userData.sec_uid || '',
                    followers: userData.follower_count || 0,
                    following: userData.following_count || 0,
                    user_age: userData.user_age || -1
                };


                // 将数据写入数据库
                const addResult = await this.addUser(userInfo);

                if (addResult) {
                    return {
                        success: true,
                        message: '成功获取用户信息并写入数据库',
                        userData: userInfo,
                    };
                } else {
                    return {
                        success: false,
                        error: '用户数据写入数据库失败',
                    };
                }
            } else {
                return {
                    success: false,
                    error: '响应数据结构不正确',
                    responseData: responseData
                };
            }
        } catch (e: any) {
            logger.error('从链接提取UID失败：', e);
            return {
                success: false,
                error: '提取用户ID失败',
                dbError: e.message
            };
        }
    }

    /**
     * 通过关键词搜索视频并提取用户信息
     * @param {Object} params - 搜索参数
     * @returns {Object} 结果
     */
    async searchVideosByKeyword(params: SearchParams): Promise<VideoSearchResult> {
        try {
            let query = `SELECT * FROM video WHERE 1=1`;
            const queryParams: any = {};

            if (params.keyword) {
                query += ` AND keyword = @keyword`;
                queryParams.keyword = params.keyword;
            }

            const stmt = this.db.prepare(query);
            const videos = stmt.all(queryParams);

            return {
                success: true,
                data: videos
            };
        } catch (error: any) {
            return {
                success: false,
                error: '搜索视频失败',
                errorDetail: error.message
            };
        }
    }

    async getUnprocessedVideos(): Promise<VideoSearchResult> {
        try {
            const stmt = this.db.prepare('SELECT * FROM video WHERE is_processed = 0');
            const videos = stmt.all();

            return {
                success: true,
                data: videos
            };
        } catch (error: any) {
            return {
                success: false,
                error: '获取未处理视频失败',
                errorDetail: error.message
            };
        }
    }

    async markVideoAsProcessed(awemeId: string): Promise<boolean> {
        try {
            await this._updateVideoStatus(awemeId, true);
            return true;
        } catch (error: any) {
            logger.error('标记视频处理状态失败:', error);
            return false;
        }
    }

    /**
     * 初始化视频表
     * @private
     */
    private async _initVideoTable(): Promise<void> {
        const sql = `
        CREATE TABLE IF NOT EXISTS video (
            "aweme_id" TEXT PRIMARY KEY,
            "keyword" TEXT,
            "is_processed" INTEGER DEFAULT 0,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        try {
            this.db.exec(sql);
            logger.info('视频表初始化成功');
        } catch (e: any) {
            logger.error('视频表初始化失败:', e);
        }
    }

    /**
     * 将视频ID保存到数据库
     * @param {Array<string>} videoIds - 视频ID列表
     * @param {string} keyword - 搜索关键词
     * @private
     */
    private async _saveVideoIds(videoIds: string[], keyword: string): Promise<void> {
        if (!Array.isArray(videoIds) || videoIds.length === 0) {
            return;
        }

        try {
            // 开始事务
            this.db.transaction((videoIds: string[], keyword: string) => {
                const sql = `INSERT OR IGNORE INTO video (aweme_id, keyword, is_processed) VALUES (?, ?, 0)`;
                const stmt = this.db.prepare(sql);

                for (const videoId of videoIds) {
                    stmt.run(videoId, keyword);
                }
            })(videoIds, keyword);

            logger.info(`成功保存${videoIds.length}个视频ID，关键词: ${keyword}`);
        } catch (e: any) {
            logger.error('保存视频ID失败:', e);
        }
    }

    /**
     * 更新视频处理状态
     * @param {string} awemeId - 视频ID
     * @param {boolean} isProcessed - 是否已处理
     * @private
     */
    private async _updateVideoStatus(awemeId: string, isProcessed: boolean): Promise<void> {
        try {
            const stmt = this.db.prepare('UPDATE video SET is_processed = ? WHERE aweme_id = ?');
            stmt.run(isProcessed ? 1 : 0, awemeId);
            logger.info(`更新视频${awemeId}处理状态为${isProcessed ? '已处理' : '未处理'}`);
        } catch (e: any) {
            logger.error('更新视频处理状态失败:', e);
        }
    }

    /**
     * 获取抖音视频搜索结果
     * @param {string} keyword - 关键词
     * @param {number} offset - 偏移量
     * @param {number} count - 数量
     * @param {number} sortType - 排序方式
     * @param {number} publishTime - 发布时间
     * @param {string|number} filterDuration - 视频时长
     * @param {string} searchId - 搜索ID
     * @returns {Promise<Object>} 搜索结果
     * @private
     */
    private async _fetchVideoSearchResult(
        keyword: string,
        offset: number,
        count: number,
        sortType: number,
        publishTime: number,
        filterDuration: string | number,
        searchId: string
    ): Promise<VideoSearchResult> {
        try {
            const params: any = {
                keyword,
                offset,
                count,
                sort_type: sortType,
                publish_time: publishTime,
                filter_duration: filterDuration
            };

            if (searchId) {
                params.search_id = searchId;
            }

            const headers = {
                "Authorization": "Bearer xq4uFGBJ4UQ1uxAU9GOWnmUIw1kwv4bh75Bb8Wzu6k9j0WIuXfQv7CasUw=="
            };

            const response = await axios.get('https://api.tikhub.io/api/v1/douyin/web/fetch_video_search_result', {
                params,
                headers,
                timeout: 30000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (e: any) {
            logger.error('获取视频搜索结果失败:', e);
            return {
                success: false,
                error: e.message,
                errorDetail: e.response ? e.response.data : null
            };
        }
    }

    /**
     * 从视频评论中提取用户
     * @param {string} videoId - 视频ID
     * @param {number} targetUserCount - 目标用户数量
     * @returns {Promise<Array>} 提取的用户列表
     * @private
     */
    private async _extractUsersFromVideoComments(videoId: string, targetUserCount: number): Promise<User[]> {
        try {
            let currentCursor = 0;
            let extractedUsers: User[] = [];
            let shouldContinue = true;

            logger.info(`开始从视频(${videoId})评论中提取用户，目标数量: ${targetUserCount}`);

            while (shouldContinue && extractedUsers.length < targetUserCount) {
                // 获取视频评论
                const commentsResult = await this._fetchVideoComments(videoId, currentCursor);

                if (!commentsResult.success) {
                    logger.error('获取视频评论失败:', commentsResult.error);
                    break;
                }

                const responseData = commentsResult.data || {};

                // 从responseData.data中获取评论数据
                const dataObject = responseData.data || {};

                // 从data对象中提取comments、cursor和has_more
                const comments = dataObject.comments || [];
                currentCursor = dataObject.cursor;
                shouldContinue = dataObject.has_more === 1;

                logger.info(`获取到${comments.length}条评论，hasMore: ${shouldContinue}, 下一页cursor: ${currentCursor}`);
                logger.info(`响应数据结构: data有${comments.length}条评论, cursor=${currentCursor}, has_more=${dataObject.has_more}`);

                if (comments.length === 0) {
                    break;
                }

                // 提取评论中的用户secUid
                const secUids: string[] = [];
                for (const comment of comments) {
                    // 尝试从评论对象直接获取sec_uid
                    if (comment.sec_uid && !secUids.includes(comment.sec_uid)) {
                        secUids.push(comment.sec_uid);
                        continue;
                    }

                    // 如果直接获取失败，尝试从user对象中获取
                    if (comment.user && comment.user.sec_uid && !secUids.includes(comment.user.sec_uid)) {
                        secUids.push(comment.user.sec_uid);
                    }
                }

                logger.info(`从评论中提取到${secUids.length}个唯一的secUid`);

                // 过滤掉已经在数据库中存在的用户
                const filteredSecUids = await this._filterExistingUsers(secUids);
                logger.info(`过滤掉已存在用户后，还有${filteredSecUids.length}个用户需要获取信息`);

                if (filteredSecUids.length === 0) {
                    continue; // 继续获取下一页评论
                }

                // 分批次并行处理用户信息获取
                const batchSize = 5; // 每批处理的用户数量
                const delay = 200; // 批次间延迟，避免API限流

                for (let i = 0; i < filteredSecUids.length && extractedUsers.length < targetUserCount; i += batchSize) {
                    // 获取当前批次的secUids
                    const batchSecUids = filteredSecUids.slice(i, i + batchSize);

                    // 并行处理当前批次的请求
                    const batchPromises = batchSecUids.map(secUid =>
                        this._fetchUserInfoBySecUid(secUid)
                        .then(result => {
                            if (result.success && result.userData) {
                                return result.userData;
                            }
                            return null;
                        })
                        .catch(err => {
                            logger.error(`获取用户(${secUid})信息失败:`, err);
                            return null;
                        })
                    );

                    // 等待当前批次的所有请求完成
                    const batchResults = await Promise.all(batchPromises);

                    // 过滤出成功获取的用户数据
                    const validUsers = batchResults.filter(user => user !== null) as User[];
                    extractedUsers = [...extractedUsers, ...validUsers];

                    logger.info(`当前批次成功获取${validUsers.length}个用户，累计获取${extractedUsers.length}个用户`);

                    // 如果已经达到目标用户数，跳出循环
                    if (extractedUsers.length >= targetUserCount) {
                        break;
                    }

                    // 批次间添加延迟，避免API限流
                    if (i + batchSize < filteredSecUids.length) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            logger.info(`从视频(${videoId})评论中共提取了${extractedUsers.length}个用户`);
            return extractedUsers;
        } catch (e: any) {
            logger.error('从视频评论中提取用户失败:', e);
            return [];
        }
    }

    /**
     * 过滤掉已经存在于数据库中的用户
     * @param {Array<string>} secUids - 用户secUid列表
     * @returns {Promise<Array<string>>} 不存在于数据库中的secUid列表
     * @private
     */
    private async _filterExistingUsers(secUids: string[]): Promise<string[]> {
        try {
            if (secUids.length === 0) {
                return [];
            }

            // 构建IN查询的占位符
            const placeholders = secUids.map(() => '?').join(',');

            // 查询已存在的用户
            const sql = `SELECT sec_uid FROM ${this.userTableName} WHERE sec_uid IN (${placeholders})`;
            const stmt = this.db.prepare(sql);
            const existingUsers = stmt.all(secUids) as { sec_uid: string }[];

            // 提取已存在用户的secUid
            const existingSecUids = existingUsers.map(user => user.sec_uid);

            // 过滤掉已存在的用户
            return secUids.filter(secUid => !existingSecUids.includes(secUid));
        } catch (e: any) {
            logger.error('过滤已存在用户失败:', e);
            return secUids; // 如果出错，返回原始列表
        }
    }

    /**
     * 获取视频评论
     * @param {string} awemeId - 视频ID
     * @param {number} cursor - 游标
     * @param {number} count - 数量
     * @returns {Promise<Object>} 评论结果
     * @private
     */
    private async _fetchVideoComments(awemeId: string, cursor = 0, count = 20): Promise<VideoSearchResult> {
        try {
            const params = {
                aweme_id: awemeId,
                cursor,
                count
            };

            const headers = {
                "Authorization": "Bearer xq4uFGBJ4UQ1uxAU9GOWnmUIw1kwv4bh75Bb8Wzu6k9j0WIuXfQv7CasUw=="
            };

            const response = await axios.get('https://api.tikhub.io/api/v1/douyin/web/fetch_video_comments', {
                params,
                headers,
                timeout: 30000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (e: any) {
            logger.error('获取视频评论失败:', e);
            return {
                success: false,
                error: e.message,
                errorDetail: e.response ? e.response.data : null
            };
        }
    }

    /**
     * 通过secUid获取用户信息
     * @param {string} secUid - 用户secUid
     * @returns {Promise<Object>} 用户信息
     * @private
     */
    private async _fetchUserInfoBySecUid(secUid: string): Promise<UserInfoResult> {
        try {
            const params = {
                sec_user_id: secUid
            };

            const headers = {
                "Authorization": "Bearer xq4uFGBJ4UQ1uxAU9GOWnmUIw1kwv4bh75Bb8Wzu6k9j0WIuXfQv7CasUw=="
            };

            // 发送请求获取用户信息
            const response = await axios.get('https://api.tikhub.io/api/v1/douyin/web/handler_user_profile_v4', {
                params,
                headers,
                timeout: 10000
            });

            // 获取响应数据
            const responseData = response.data;

            // 数据清洗与提取
            if (responseData && responseData.data) {
                const userData = responseData.data.user;
                const liveUser = responseData.data.live_user;

                if (!userData) {
                    return {
                        success: false,
                        error: '响应数据中没有user信息',
                    };
                }

                // 提取需要的字段
                const userInfo: User = {
                    uid: userData.uid || '',
                    nickname: userData.nickname || '',
                    gender: liveUser && typeof liveUser.gender !== 'undefined' ? liveUser.gender : -1,
                    sec_uid: userData.sec_uid || '',
                    followers: userData.follower_count || 0,
                    following: userData.following_count || 0,
                    user_age: userData.user_age || -1
                };

                // 将数据写入数据库
                const addResult = await this.addUser(userInfo);

                // 使用getMainWindow发送消息到渲染进程
                try {
                    const win = getMainWindow();
                    if (win && !win.isDestroyed()) {
                        win.webContents.send('user-extracted', {
                            userInfo,
                            timestamp: new Date().toISOString()
                        });
                        logger.info(`成功发送用户 ${userInfo.nickname} 提取通知到前端`);
                    }
                } catch (ipcError: any) {
                    logger.warn('发送IPC消息失败:', ipcError.message);
                }

                if (addResult) {
                    return {
                        success: true,
                        message: '成功获取用户信息并写入数据库',
                        userData: userInfo,
                    };
                } else {
                    return {
                        success: false,
                        error: '用户数据写入数据库失败',
                    };
                }
            } else {
                return {
                    success: false,
                    error: '响应数据结构不正确',
                };
            }
        } catch (e: any) {
            logger.error('获取用户信息失败:', e);
            return {
                success: false,
                error: e.message,
            };
        }
    }

    private async _getUnprocessedVideosByKeyword(keyword: string): Promise<string[]> {
        try {
            const stmt = this.db.prepare('SELECT GROUP_CONCAT(aweme_id) as ids FROM video WHERE keyword = @keyword AND is_processed = 0');
            const result = stmt.get({ keyword }) as { ids: string } | undefined;
            if (!result || !result.ids) {
                return [];
            }
            return result.ids.split(',');
        } catch (e: any) {
            logger.error('获取未处理视频失败:', e);
            return [];
        }
    }

    private async _checkExistingSecUids(secUids: string[]): Promise<string[]> {
        if (!Array.isArray(secUids) || secUids.length === 0) {
            return [];
        }

        try {
            const existingSecUids: string[] = [];
            const stmt = this.db.prepare(`SELECT sec_uid FROM ${this.userTableName} WHERE sec_uid = ?`);

            for (const secUid of secUids) {
                const result = stmt.get(secUid) as { sec_uid: string } | undefined;
                if (result) {
                    existingSecUids.push(result.sec_uid);
                }
            }

            return existingSecUids;
        } catch (error: any) {
            logger.error('检查现有用户失败:', error);
            return [];
        }
    }

    private async _checkExistingSecUidsInBatch(secUids: string[]): Promise<string[]> {
        if (!Array.isArray(secUids) || secUids.length === 0) {
            return [];
        }

        try {
            const placeholders = secUids.map(() => '?').join(',');
            const sql = `SELECT sec_uid FROM ${this.userTableName} WHERE sec_uid IN (${placeholders})`;
            const stmt = this.db.prepare(sql);
            const existingUsers = stmt.all(secUids) as { sec_uid: string }[];
            return existingUsers.map(u => u.sec_uid);
        } catch (error: any) {
            logger.error('批量检查现有用户失败:', error);
            return [];
        }
    }
}

UserdbService.toString = () => '[class UserdbService]';
const userdbService = new UserdbService();

export {
  UserdbService,
  userdbService
};