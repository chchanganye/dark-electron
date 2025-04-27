import { logger } from 'ee-core/log';
import { getConfig } from 'ee-core/config';
import axios from 'axios';

// effect service
class EffectService {
  async register(args: { username: string; nickname: string; password: string; card_key: string }) {
    const config = getConfig();
    const url = `${config.serverUrl}/api/users/register/`;
    try {
      const response = await axios.post(url, {
        username: args.username,
        nickname: args.nickname,
        password: args.password,
        card_key: args.card_key
      });
      return response.data;
    } catch (error: any) {
      logger.error('注册请求异常', error?.response?.data || error);
      return error?.response?.data || { code: 500, message: '注册异常' };
    }
  }

  async login(args: { username: string; password: string }) {
    const config = getConfig();
    const url = `${config.serverUrl}/api/users/login/`;
    try {
      const response = await axios.post(url, {
        username: args.username,
        password: args.password
      });
      return response.data;
    } catch (error: any) {
      logger.error('登录请求异常', error?.response?.data || error);
      return error?.response?.data || { code: 500, message: '登录异常' };
    }
  }

  /**
   * 自动登录验证
   * @param args - 包含用户ID和访问令牌
   */
  async autoLogin(args: { userId: string; accessToken: string }) {
    const config = getConfig();
    const url = `${config.serverUrl}/api/verify_token/`;
    try {
      const response = await axios.post(
        url,
        {}, // POST body为空
        {
          headers: {
            Authorization: `Bearer ${args.accessToken}`
          }
        }
      );
      // 直接返回后端的标准结构
      return response.data;
    } catch (error: any) {
      logger.error('自动登录请求异常', error?.response?.data || error);
      // 兼容后端返回的错误结构
      return (
        error?.response?.data || {
          code: 500,
          message: '自动登录异常',
          data: null
        }
      );
    }
  }
}
EffectService.toString = () => '[class EffectService]';
const effectService = new EffectService();

export {
  EffectService,
  effectService
}