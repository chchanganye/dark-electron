import { dialog } from 'electron';
import { getMainWindow } from 'ee-core/electron';
import { effectService } from '../service/effect';
/**
 * effect - demo
 * @class
 */
class EffectController {

  /**
   * select file
   */
  selectFile(): string | null {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openFile']
    });

    if (!filePaths) {
      return null
    }

    return filePaths[0];
  }

  /**
   * login window
   */
  loginWindow(args: { width?: number; height?: number }): void {
    const { width, height } = args;
    const win = getMainWindow();
    
    const size = {
      width: width || 400,
      height: height || 600
    }
    win.setSize(size.width, size.height);
    win.setResizable(true);
    win.center();
    win.show();
    win.focus();
  }
  
  /**
   * restore window
   */
  restoreWindow(args: { width?: number; height?: number }): void {
    const { width, height } = args;
    const win = getMainWindow();

    const size = {
      width: width || 980,
      height: height || 650
    }
    win.setSize(size.width, size.height);
    win.setResizable(true);
    win.center();
    win.show();
    win.focus();
  }   

  async register(args: { username: string; nickname: string; password: string; card_key: string }): Promise<{ success: boolean; message: string }> {
    if (args.username.length < 6 || args.username.length > 16) {
      return { success: false, message: '账号长度必须在6到16之间' };
    }
    if (args.password.length < 6 || args.password.length > 16) {
      return { success: false, message: '密码长度必须在6到16之间' };
    }
    if (args.card_key.length !== 32) {
      return { success: false, message: '卡密必须32位' };
    }
    return await effectService.register({
      username: args.username,
      nickname: args.nickname,
      password: args.password,
      card_key: args.card_key
    });
  }

  async login(args: { username: string; password: string }): Promise<{ success: boolean; message: string; data?: any }> {
    if (!args.username || !args.password) {
      return { success: false, message: '账号和密码不能为空' };
    }
    return await effectService.login({
      username: args.username,
      password: args.password
    });
  }

  async autoLogin(args: { userId: string; accessToken: string }): Promise<{ success: boolean; message: string; data?: any }> {
    if (!args.userId || !args.accessToken) {
      return { success: false, message: '自动登录信息缺失' };
    }
    return await effectService.autoLogin({
      userId: args.userId,
      accessToken: args.accessToken
    });
  }

}
EffectController.toString = () => '[class EffectController]';

export default EffectController; 