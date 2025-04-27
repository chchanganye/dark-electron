/**
 * 自动登录接口单元测试
 * 用于验证 /api/verify_token 接口的正确性
 * 
 * 使用方法：在项目根目录下运行 jest 或 npx jest
 */

import axios from 'axios';

describe('自动登录接口 /api/verify_token', () => {
  const serverUrl = 'http://localhost:8888'; // 替换为你的后端服务地址
  const apiUrl = `${serverUrl}/api/verify_token/`;

  it('token有效时应返回用户信息和code=200', async () => {
    // 这里需要先获取一个有效token，可以通过登录接口获取
    const loginRes = await axios.post(`${serverUrl}/api/users/login/`, {
      username: 'tutu0903',
      password: 'wamiku184'
    });
    console.log('登录成功', loginRes.data);
    const token = loginRes.data.data.tokens.access;

    const res = await axios.post(apiUrl, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('自动登录接口返回', res.data);

    expect(res.data.code).toBe(200);
    expect(res.data.data.user).toBeDefined();
    expect(res.data.data.user.username).toBe('tutu0903');
  });

  it('token无效时应返回401', async () => {
    try {
      await axios.post(apiUrl, {}, {
        headers: {
          Authorization: 'Bearer invalid_token'
        }
      });
      throw new Error('请求未抛出401异常');
    } catch (error: any) {
      console.log('无效token返回', error.response?.data);
      expect(error.response.status).toBe(401);
      expect(error.response.data.detail || error.response.data.message)
        .toMatch(/token_not_valid|未授权|令牌验证失败|此令牌对任何类型的令牌无效/);
    }
  });
}); 