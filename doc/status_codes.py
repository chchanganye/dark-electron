"""
API状态码定义模块
用于统一管理所有API返回的状态码和消息
"""

# 成功状态码
SUCCESS = 200  # 请求成功
CREATED = 201  # 创建成功

# 客户端错误状态码
BAD_REQUEST = 400  # 请求参数错误
UNAUTHORIZED = 401  # 未授权
FORBIDDEN = 403  # 禁止访问
NOT_FOUND = 404  # 资源不存在

# 服务器错误状态码
INTERNAL_SERVER_ERROR = 500  # 服务器内部错误

# 业务状态码
USERNAME_EXISTS = 1001  # 用户名已存在
CARD_KEY_INVALID = 1002  # 卡密无效
CARD_KEY_EXPIRED = 1003  # 卡密已过期
BALANCE_INSUFFICIENT = 1004  # 余额不足
INVALID_SIGNATURE = 1005  # 无效的请求签名
INVALID_OPERATION = 1006  # 不支持的操作类型
INVALID_AMOUNT = 1007  # 金额格式不正确

# 状态码对应的消息
STATUS_MESSAGES = {
    SUCCESS: "操作成功",
    CREATED: "创建成功",
    BAD_REQUEST: "请求参数错误",
    UNAUTHORIZED: "未授权",
    FORBIDDEN: "禁止访问",
    NOT_FOUND: "资源不存在",
    INTERNAL_SERVER_ERROR: "服务器内部错误",
    USERNAME_EXISTS: "用户名已存在",
    CARD_KEY_INVALID: "卡密不存在或已被使用",
    CARD_KEY_EXPIRED: "卡密已过期",
    BALANCE_INSUFFICIENT: "余额不足",
    INVALID_SIGNATURE: "无效的请求签名",
    INVALID_OPERATION: "不支持的操作类型",
    INVALID_AMOUNT: "金额格式不正确"
} 