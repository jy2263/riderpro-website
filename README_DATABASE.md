# RiderPro 登录/注册系统设置指南

## 项目概述

这是一个基于 SQLite 数据库的登录/注册系统，使用 Node.js + Express 后端和原生 JavaScript 前端。

**重要**: 网站现在需要登录才能访问！用户必须先注册/登录才能查看网站内容。

## 系统架构

- **前端**: HTML + JavaScript
  - **index.html** - 登录/注册页面（网站入口）
  - **home.html** - 主页（需要登录）
  - **auth.js** - 登录验证中间件
- **后端**: Node.js + Express (server.js)
- **数据库**: SQLite (riderpro.db 文件)
- **密码加密**: bcrypt

---

## 快速开始

### 1. 安装依赖

首先确保你的电脑已安装 Node.js。然后在项目目录运行:

```bash
cd "riderpro-website-main 2"
npm install
```

### 2. 启动后端服务器

```bash
npm start
# 或者
node server.js
```

你应该看到:
```
✅ Database initialized successfully
🚀 RiderPro Backend Server is running!
📡 Server: http://localhost:3000
🗄️  Database: riderpro.db
```

### 3. 启动前端网页

保持后端服务器运行，在另一个终端启动前端:

```bash
python -m http.server 8000
```

然后在浏览器打开: http://localhost:8000

**重要**:
- 首次访问会自动跳转到登录页面 (index.html)
- 必须先注册账号，然后登录
- 登录成功后会自动跳转到主页 (home.html)
- 所有其他页面都需要登录才能访问

### 4. 使用流程

1. 访问 http://localhost:8000 或 http://localhost:8000/index.html
2. 如果是新用户，点击 "Register" 标签注册账号
3. 填写完整信息（姓名、邮箱、手机、密码）并提交
4. 注册成功后，切换到 "Login" 标签
5. 使用注册的邮箱和密码登录
6. 登录成功后会自动跳转到主页
7. 导航栏会显示你的名字和"Logout"按钮
8. 点击 "Logout" 可以退出登录

### 5. 安全特性

- 未登录用户尝试访问任何页面都会被重定向到登录页面
- 已登录用户访问登录页面会自动跳转到主页
- 用户信息存储在 localStorage 中
- 密码使用 bcrypt 加密存储

---

## 与小组成员共享数据库

### 方案 1: 共享数据库文件 (推荐用于本地开发)

1. **找到数据库文件**:
   - 文件名: `riderpro.db`
   - 位置: `riderpro-website-main 2/riderpro.db`

2. **分享给小组成员**:
   - 通过 Google Drive / OneDrive / Dropbox 分享
   - 或通过 Git 提交 (注意: 生产环境不推荐提交数据库文件)
   - 或通过 USB / 局域网传输

3. **小组成员使用**:
   - 将 `riderpro.db` 文件放到他们的 `riderpro-website-main 2/` 目录下
   - 运行 `node server.js` 启动服务器
   - 现在他们可以看到相同的用户数据

### 方案 2: 局域网共享 (同一 WiFi 网络)

如果你和小组成员在同一网络(比如同一个 WiFi):

1. **修改 server.js** (第 195 行):
```javascript
// 改为:
app.listen(PORT, '0.0.0.0', () => {
```

2. **查找你的本机IP地址**:
```bash
# Windows:
ipconfig
# 查找 "IPv4 Address"，比如: 192.168.1.100

# Mac/Linux:
ifconfig
# 查找 "inet"，比如: 192.168.1.100
```

3. **分享给小组成员**:
   - 告诉他们你的 IP 地址，比如 `192.168.1.100`
   - 他们修改 contact.html 中的 API 地址:
   ```javascript
   // 第 503 和 548 行，改为:
   fetch('http://192.168.1.100:3000/api/login', ...)
   fetch('http://192.168.1.100:3000/api/register', ...)
   ```
   - 他们访问 `http://192.168.1.100:8000` 即可使用你的数据库

### 方案 3: Git 协作

1. **创建 .gitignore** (如果还没有):
```
node_modules/
riderpro.db
```

2. **提交代码到 Git**:
```bash
git add .
git commit -m "Add login/register system"
git push
```

3. **小组成员克隆代码**:
```bash
git clone <你的仓库地址>
cd riderpro-website-main\ 2
npm install
node server.js
```

注意: 每个成员都会有自己独立的数据库。如果需要共享数据库，使用方案 1 或 2。

---

## API 接口文档

### 1. 注册新用户

**请求**:
```
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "fullname": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Registration successful!"
}
```

### 2. 用户登录

**请求**:
```
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Login successful!",
  "user": {
    "id": 1,
    "fullname": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000"
  }
}
```

### 3. 查看所有用户 (调试用)

**请求**:
```
GET http://localhost:3000/api/users
```

**响应**:
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "fullname": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "created_at": "2025-12-02 08:25:00"
    }
  ]
}
```

---

## 数据库结构

### users 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INTEGER | 主键，自动递增 |
| fullname | TEXT | 用户全名 |
| email | TEXT | 邮箱 (唯一) |
| phone | TEXT | 手机号 |
| password | TEXT | 加密后的密码 |
| created_at | DATETIME | 创建时间 |

---

## 常见问题

### Q: 启动服务器时提示端口被占用怎么办?

修改 server.js 第 9 行的端口号:
```javascript
const PORT = 3001; // 改成其他端口
```

然后也要修改 contact.html 中的 API 地址。

### Q: 前端报错 "Network error" 怎么办?

确保:
1. 后端服务器正在运行 (http://localhost:3000)
2. 浏览器没有阻止跨域请求
3. 检查浏览器控制台的具体错误信息

### Q: 如何重置数据库?

删除 `riderpro.db` 文件，然后重启服务器，会自动创建新的空数据库。

### Q: 如何查看数据库内容?

推荐使用 SQLite 浏览器工具:
- DB Browser for SQLite: https://sqlitebrowser.org/
- 或使用命令行: `sqlite3 riderpro.db "SELECT * FROM users;"`

### Q: 密码安全吗?

是的，密码使用 bcrypt 加密存储，即使数据库泄露，攻击者也无法直接获取明文密码。

---

## 技术栈

- **后端框架**: Express.js
- **数据库**: SQLite (使用 sql.js 库)
- **密码加密**: bcrypt
- **跨域支持**: CORS

---

## 文件说明

- `server.js` - 后端服务器代码
- `package.json` - 项目依赖配置
- `riderpro.db` - SQLite 数据库文件
- `contact.html` - 登录/注册页面
- `README_DATABASE.md` - 本说明文档

---

## 联系支持

如有问题，请联系项目负责人或查看项目文档。
