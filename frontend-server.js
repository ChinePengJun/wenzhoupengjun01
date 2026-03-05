import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = __dirname;
const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 80);
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || 'http://localhost:3000';

const app = express();

app.get('/admin*', (_req, res) => {
  res.redirect(`${ADMIN_BASE_URL}/admin`);
});

app.get('/api*', (_req, res) => {
  res.status(502).json({
    message: `前台服务不提供 API，请访问 ${ADMIN_BASE_URL}/api/...`,
  });
});

app.use(express.static(distDir));

app.get('*', (_req, res) => {
  if (fs.existsSync(indexHtmlPath)) return res.sendFile(indexHtmlPath);
  return res.status(503).send('前端构建文件不存在，请先执行 npm run build');
});

app.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log(`前台服务已启动: http://0.0.0.0:${FRONTEND_PORT}`);
  console.log(`后台入口: ${ADMIN_BASE_URL}/admin`);
});
