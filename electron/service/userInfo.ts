import axios from 'axios';
import { getConfig } from 'ee-core/config';
// example service
class UserInfoService {
  /**
   * 修改用户昵称
   * @param userId 用户ID
   * @param nickname 新昵称
   * @param token 认证token
   * @returns 接口响应
   */
  async updateNickname(userId: number, nickname: string, token: string) {
    const config = getConfig();
    const url = `${config.serverUrl}/api/users/${userId}/nickname/`;
    try {
      const response = await axios.patch(
        url,
        { nickname: nickname },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      // 错误处理，包含详细上下文
      throw new Error(`修改昵称失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
UserInfoService.toString = () => '[class UserInfoService]';
const userInfoService = new UserInfoService();

export {
  UserInfoService,
  userInfoService
};