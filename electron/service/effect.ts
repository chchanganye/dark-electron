import { logger } from 'ee-core/log';
import { getConfig } from 'ee-core/config';
import axios from 'axios';

// effect service
class EffectService {

  // hello
  async hello(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('EffectService obj:', obj);

    return obj;
  }

  async register(args: { username: string; nickname: string; password: string; card_key: string }): Promise<{ success: boolean; message: string }> {
    const config = getConfig();
    logger.info('服务器地址', config.serverUrl);
    const url = `${config.serverUrl}/api/users/register/`;
    logger.info('注册地址', url);
    try {
      const response = await axios.post(url, {
        username: args.username,
        nickname: args.nickname,
        password: args.password,
        card_key: args.card_key
      });
      if (response.status === 201) {
        return { success: true, message: '注册成功' };
      } else {
        return { success: false, message: response.data?.message || '注册失败' };
      }
    } catch (error: any) {
      logger.error('注册请求异常', error?.response?.data || error);
      return { success: false, message: error?.response?.data?.message || '注册异常' };
    }
  }

  async login(args: { username: string; password: string }): Promise<{ success: boolean; message: string; data?: any }> {
    const config = getConfig();
    const url = `${config.serverUrl}/api/users/login/`;
    try {
      const response = await axios.post(url, {
        username: args.username,
        password: args.password
      });
      logger.info('登录响应', response.data);
      if (response.status === 200) {
        return { success: true, message: '登录成功', data: response.data };
      } else {
        return { success: false, message: response.data?.message || '登录失败' };
      }
    } catch (error: any) {
      logger.error('登录请求异常', error?.response?.data || error);
      return { success: false, message: error?.response?.data?.message || '登录异常' };
    }
  }

  async autoLogin(args: { userId: string; accessToken: string }): Promise<{ success: boolean; message: string; data?: any }> {
    const config = getConfig();
    const url = `${config.serverUrl}/api/users/${args.userId}/balance/`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${args.accessToken}`
        }
      });
      if (response.status === 200) {
        return { success: true, message: '自动登录成功', data: response.data };
      } else {
        return { success: false, message: response.data?.message || '自动登录失败' };
      }
    } catch (error: any) {
      logger.error('autoLogin参数 userId:', args.userId, 'accessToken:', args.accessToken);
      logger.error('自动登录请求异常', error?.response?.data || error);
      return { success: false, message: error?.response?.data?.message || '自动登录异常' };
    }
  }
}
EffectService.toString = () => '[class EffectService]';
const effectService = new EffectService();

export {
  EffectService,
  effectService
}