<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/69792749-f6f2-4934-a613-8330101956e0

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set env in `.env.local`
3. Run website frontend:
   `npm run dev`

## 后台管理系统（前后端）

本项目现已包含后台管理前端页面与后台 API。

### 1) 启动后台 API

```bash
npm run admin:dev
```

默认地址：`http://localhost:3100`

### 2) 启动前台/后台前端

```bash
npm run dev
```

- 官网前端入口：`http://localhost:3000/`
- 后台前端入口：`http://localhost:3000/admin`

### 默认管理员账号

- 用户名：`admin`
- 密码：`admin123456`

### 主要后台接口

- `POST /api/admin/auth/login` 管理员登录
- `POST /api/admin/auth/logout` 管理员退出
- `GET /api/admin/dashboard/stats` 控制台统计
- `GET/POST/PUT/DELETE /api/admin/users` 用户管理
- `GET/POST/PUT/DELETE /api/admin/announcements` 公告管理
