# 余额接口使用指南

本文档详细说明了用户管理系统中余额接口的使用方法，包括客户端如何调用接口、请求参数、响应格式，以及如何计算API签名等内容。

## 1. 接口概述

余额接口用于查询和修改用户账户余额，支持两种操作：
- **查询余额**：获取用户的当前余额和卡密信息
- **修改余额**：增加或减少用户的账户余额

接口地址：`/api/users/{user_id}/balance/`

## 2. 接口认证

所有对余额接口的请求都需要进行身份验证和授权，系统采用两种安全机制：

1. **JWT令牌认证**：确保请求来自已登录的合法用户
2. **请求签名验证**（仅修改余额时需要）：确保请求内容未被篡改

### 2.1 获取JWT令牌

在调用余额接口前，客户端需要先通过登录接口获取JWT令牌：

```http
POST /api/users/login/
Content-Type: application/json

{
    "account": "用户账号",
    "password": "用户密码"
}
```

成功登录后，服务器会返回访问令牌（access token）和刷新令牌（refresh token）：

```json
{
    "message": "登录成功",
    "user": {
        "id": 1,
        "username": "测试用户",
        "account": "test123",
        "balance": "100.00",
        "card_expire": "2023-12-31T23:59:59Z"
    },
    "tokens": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### 2.2 令牌使用方式

在调用余额接口时，需要在请求头中添加JWT令牌：

```
Authorization: Bearer {access_token}
```

## 3. 查询余额接口

### 3.1 请求格式

```http
GET /api/users/{user_id}/balance/
Authorization: Bearer {access_token}
```

### 3.2 响应格式

```json
{
    "user_id": 1,
    "username": "测试用户",
    "account": "test123",
    "balance": "100.00",
    "card_key_type": "一周",
    "card_bound_at": "2023-06-01T12:00:00Z",
    "card_expire": "2023-06-08T12:00:00Z"
}
```

### 3.3 权限要求

- 用户只能查询自己的余额信息
- 管理员可以查询任何用户的余额信息

## 4. 修改余额接口

### 4.1 请求格式

```http
PATCH /api/users/{user_id}/balance/
Authorization: Bearer {access_token}
X-API-Signature: {计算得到的签名}
Content-Type: application/json

{
    "operation": "add",   // 或 "subtract"
    "amount": "50.00",
    "description": "充值"  // 可选参数
}
```

### 4.2 请求参数说明

| 参数名 | 类型 | 必选 | 说明 |
|-------|------|-----|------|
| operation | string | 是 | 操作类型：`add`（增加余额）或 `subtract`（减少余额） |
| amount | decimal | 是 | 操作金额，必须大于0 |
| description | string | 否 | 交易描述，会记录在交易历史中 |

### 4.3 响应格式

```json
{
    "message": "余额增加成功",
    "user_id": 1,
    "balance": "150.00",
    "operation": "add",
    "amount": "50.00"
}
```

### 4.4 签名计算方法

为确保余额操作的安全性，所有修改余额的请求必须附带有效的签名。签名的计算方法如下：

1. 客户端和服务器共享一个密钥（API_SECRET）
2. 对请求体（request body）进行HMAC-SHA256签名计算
3. 将计算结果以十六进制形式放在请求头的`X-API-Signature`字段中

#### 签名计算示例（Python）：

```python
import hmac
import hashlib
import json

def calculate_signature(request_body, api_secret):
    """
    计算API请求签名
    
    参数:
    - request_body: 请求体的JSON字符串
    - api_secret: API密钥
    
    返回:
    - 计算得到的签名（十六进制字符串）
    """
    # 确保请求体是字节类型
    if isinstance(request_body, str):
        request_body = request_body.encode('utf-8')
    elif isinstance(request_body, dict):
        request_body = json.dumps(request_body).encode('utf-8')
    
    # 计算HMAC-SHA256签名
    signature = hmac.new(
        api_secret.encode('utf-8'),
        request_body,
        hashlib.sha256
    ).hexdigest()
    
    return signature

# 使用示例
api_secret = "your_api_secret_key"  # 与服务器配置中的API_SECRET一致
request_body = {
    "operation": "add",
    "amount": "50.00",
    "description": "充值"
}

# 将请求体转换为JSON字符串（实际发送时的形式）
json_body = json.dumps(request_body)

# 计算签名
signature = calculate_signature(json_body, api_secret)
print(f"X-API-Signature: {signature}")
```

#### JavaScript示例：

```javascript
async function calculateSignature(requestBody, apiSecret) {
    // 转换API密钥为Uint8Array
    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiSecret);
    
    // 创建密钥对象
    const key = await crypto.subtle.importKey(
        'raw', 
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false, 
        ['sign']
    );
    
    // 准备请求数据
    const data = (typeof requestBody === 'string') 
        ? encoder.encode(requestBody)
        : encoder.encode(JSON.stringify(requestBody));
    
    // 计算签名
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        data
    );
    
    // 转换为十六进制字符串
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 使用示例
const apiSecret = "your_api_secret_key";  // 与服务器配置中的API_SECRET一致
const requestBody = {
    operation: "add",
    amount: "50.00",
    description: "充值"
};

// 计算签名
calculateSignature(requestBody, apiSecret).then(signature => {
    console.log(`X-API-Signature: ${signature}`);
});
```

### 4.5 权限要求

- 用户只能修改自己的余额信息，且必须提供有效签名
- 管理员可以修改任何用户的余额信息，同样需要提供有效签名

## 5. 完整调用示例

### 5.1 查询余额 (Python)

```python
import requests

# 配置信息
base_url = "https://your-api-domain.com/api"
user_id = 1
access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# 设置请求头
headers = {
    "Authorization": f"Bearer {access_token}"
}

# 发送查询余额请求
response = requests.get(
    f"{base_url}/users/{user_id}/balance/",
    headers=headers
)

# 处理响应
if response.status_code == 200:
    balance_info = response.json()
    print(f"当前余额: {balance_info['balance']}")
    print(f"卡密类型: {balance_info['card_key_type']}")
    print(f"过期时间: {balance_info['card_expire']}")
else:
    print(f"查询失败: {response.json().get('message', '未知错误')}")
```

### 5.2 修改余额 (Python)

```python
import requests
import json
import hmac
import hashlib

# 配置信息
base_url = "https://your-api-domain.com/api"
user_id = 1
access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
api_secret = "your_api_secret_key"  # 与服务器配置中的API_SECRET一致

# 准备请求数据
request_data = {
    "operation": "add",
    "amount": "50.00",
    "description": "充值示例"
}

# 将请求数据转换为JSON字符串
json_data = json.dumps(request_data)

# 计算签名
signature = hmac.new(
    api_secret.encode('utf-8'),
    json_data.encode('utf-8'),
    hashlib.sha256
).hexdigest()

# 设置请求头
headers = {
    "Authorization": f"Bearer {access_token}",
    "X-API-Signature": signature,
    "Content-Type": "application/json"
}

# 发送修改余额请求
response = requests.patch(
    f"{base_url}/users/{user_id}/balance/",
    data=json_data,
    headers=headers
)

# 处理响应
if response.status_code == 200:
    result = response.json()
    print(f"操作成功: {result['message']}")
    print(f"当前余额: {result['balance']}")
else:
    print(f"操作失败: {response.json().get('message', '未知错误')}")
```

## 6. 错误处理

调用余额接口可能遇到的常见错误及其处理方式：

| 状态码 | 错误消息 | 说明 | 解决方案 |
|-------|---------|------|---------|
| 400 | 账号未绑定卡密 | 用户没有绑定有效的卡密 | 请用户绑定有效卡密 |
| 400 | 卡密已过期 | 用户的卡密已经过期 | 提示用户续费或更换卡密 |
| 400 | 缺少必要参数 | 请求中缺少必需的参数 | 检查请求是否包含所有必需参数 |
| 400 | 金额必须大于0 | 操作金额必须为正数 | 确保金额参数大于0 |
| 400 | 余额不足 | 用户余额不足以执行减少操作 | 提示用户充值 |
| 403 | 无效的请求签名 | 请求签名验证失败 | 检查签名计算方法是否正确，API密钥是否匹配 |
| 403 | 没有权限执行此操作 | 用户无权操作指定账户 | 确认用户身份和权限 |
| 404 | 用户不存在 | 指定的用户ID不存在 | 检查用户ID是否正确 |
| 500 | 服务器内部错误 | 服务器处理请求时出错 | 联系系统管理员 |

## 7. 安全建议

为确保余额操作的安全性，建议客户端实施以下措施：

1. **妥善保管API密钥**：API_SECRET是签名验证的核心，切勿泄露
2. **设置令牌过期时间**：建议为JWT令牌设置较短的有效期，减少被盗用的风险
3. **使用HTTPS**：所有API请求都应通过HTTPS发送，确保传输安全
4. **实施请求重放保护**：可以在请求中加入时间戳和随机数，防止请求被重放
5. **日志记录**：记录所有余额变动操作，便于追踪和审计

## 8. 常见问题

### 8.1 签名验证失败怎么办？

- 检查API_SECRET是否与服务器配置一致
- 确保请求体的JSON格式正确，字段顺序与签名计算时一致
- 验证请求体在传输过程中是否被修改

### 8.2 令牌过期怎么处理？

当访问令牌过期时，可以使用刷新令牌获取新的访问令牌：

```http
POST /api/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 8.3 如何处理并发操作？

余额操作具有原子性，系统会确保并发请求下的数据一致性。但建议客户端实现适当的重试机制，处理可能的冲突情况。

---

本文档最后更新于：2023年6月10日  
如有任何问题，请联系系统管理员。 