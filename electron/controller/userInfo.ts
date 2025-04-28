import { userInfoService } from '../service/userInfo';
import { logger } from 'ee-core/log';
/**
 * 用户信息控制器
 * @class
 */
class UserInfoController {
    /**
     * 修改用户昵称
     * @param args { userId, nickname, token }
     */
    async updateNickname(args: { userId: number; nickname: string; token: string }) {
        logger.info('updateNickname', args);
        return userInfoService.updateNickname(args.userId, args.nickname, args.token);
    }
}

UserInfoController.toString = () => '[class UserInfoController]';

export default UserInfoController;