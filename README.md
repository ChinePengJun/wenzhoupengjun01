<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/69792749-f6f2-4934-a613-8330101956e0

## 生产环境启动（推荐）

目标：**不用开发环境**，直接以生产方式对外提供服务（默认外网端口 `3000`）。

1. 安装依赖

```bash
npm install
```

2. 配置环境变量（可选）

```bash
cp .env.example .env.local
```

3. 一键生产启动（构建前端 + 启动统一服务）

```bash
npm run start:prod
```

服务启动后：
- 官网前端：`http://<你的服务器IP或域名>/`
- 后台前端：`http://<你的服务器IP或域名>/admin`
- 后台 API：`http://<你的服务器IP或域名>/api/...`

> 默认端口是 `3000`（由 `ADMIN_PORT` 控制），可按需修改。

## 本地开发（仅调试时）

- 前端开发：`npm run dev`
- 仅启动后端：`npm run admin:dev`

## 默认管理员账号

- 用户名：`admin`
- 密码：`admin123456`

## 主要接口

- `POST /api/admin/auth/login` 管理员登录
- `POST /api/admin/auth/logout` 管理员退出
- `GET /api/admin/dashboard/stats` 控制台统计
- `GET/POST/PUT/DELETE /api/admin/users` 用户管理
- `GET/POST/PUT/DELETE /api/admin/announcements` 公告管理
- `GET/POST/PUT/DELETE /api/admin/categories` 分类管理（影响前台）
- `GET/POST/PUT/DELETE /api/admin/products` 产品管理（影响前台）
- `GET /api/catalog` 前台产品/分类读取接口
- `GET/PUT /api/admin/site-settings` 站点信息（地址/电话/邮箱/版权）
- `POST /api/admin/upload` 上传图片/视频并返回URL
- `GET /api/site-settings` 前台站点信息读取
