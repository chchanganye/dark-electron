import { logger } from 'ee-core/log';
import { userdbService } from '../service/userdb';  

interface UserOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface User {
  uid: string;
  nickname?: string;
  user_age?: number;
  gender?: number;
  followers?: number;
  following?: number;
  sec_uid?: string;
}

interface SearchParams {
  keyword: string;
  targetUserCount?: number;
  sortType?: number;
  publishTime?: number;
  filterDuration?: string | number;
}

/**
 * 用户数据控制器
 * @class
 */
class UserdbController {

    /**
     * 获取用户列表
     */
    async getUsers(options: UserOptions = {}) {
        try {
            return await userdbService.getUsers(options);
        } catch (e: any) {
            logger.error('获取用户列表失败：', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * 添加用户
     */
    async addUser(user: User) {
        try {
            return await userdbService.addUser(user);
        } catch (e: any) {
            logger.error('添加用户失败：', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * 批量添加用户
     */
    async addUsers(users: User[]) {
        try {
            return await userdbService.addUsers(users);
        } catch (e: any) {
            logger.error('批量添加用户失败：', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * 删除用户
     */
    async deleteUser(uid: string) {
        try {
            return await userdbService.deleteUser(uid);
        } catch (e: any) {
            logger.error('删除用户失败：', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * 从抖音链接中提取UID
     */
    async extractUidFromLink(userLink: string) {
        try {
            if (!userLink) {
                return { success: false, error: '用户链接不能为空' };
            }

            logger.info('控制器: 开始从链接中提取UID');

            // 调用服务层方法
            const result = await userdbService.extractUidFromLink(userLink);

            return result;
        } catch (e: any) {
            logger.error('从链接提取UID失败：', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * 通过关键词搜索视频并提取用户信息
     */
    async searchVideosByKeyword(params: SearchParams) {
        try {
            if (!params || !params.keyword) {
                return { success: false, error: '关键词不能为空' };
            }

            logger.info('控制器: 开始通过关键词搜索视频并提取用户');

            // 调用服务层方法
            const result = await userdbService.searchVideosByKeyword(params);

            return result;
        } catch (e: any) {
            logger.error('通过关键词搜索视频并提取用户失败：', e);
            return { success: false, error: e.message };
        }
    }
}

UserdbController.toString = () => '[class UserdbController]';
export default UserdbController;