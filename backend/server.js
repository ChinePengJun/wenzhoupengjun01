import express from 'express';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DB_FILE = process.env.ADMIN_DB_PATH || path.join(projectRoot, 'data', 'admin.db');
const ADMIN_PORT = Number(process.env.ADMIN_PORT || 3100);
const ADMIN_SEED_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_SEED_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new Database(DB_FILE);

const sessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS managed_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'editor',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get(ADMIN_SEED_USERNAME);
  if (!adminExists) {
    db.prepare('INSERT INTO admins(username, password_hash) VALUES (?, ?)').run(
      ADMIN_SEED_USERNAME,
      hashPassword(ADMIN_SEED_PASSWORD),
    );
    console.log(`[admin] 已初始化默认管理员: ${ADMIN_SEED_USERNAME}`);
  }
}

function authRequired(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: '缺少管理员令牌' });
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ message: '令牌无效或已过期' });
  }

  req.admin = session;
  return next();
}

function pruneSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}

initDatabase();
setInterval(pruneSessions, 10 * 60 * 1000).unref();

const app = express();
app.use(express.json());


const ALLOWED_ORIGIN = process.env.ADMIN_CORS_ORIGIN || '*';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  return next();
});

app.get('/api/admin/health', (_req, res) => {
  res.json({ ok: true, service: 'admin-backend', time: new Date().toISOString() });
});

app.post('/api/admin/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username);
  if (!admin || admin.password_hash !== hashPassword(password)) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = newSessionToken();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, { id: admin.id, username: admin.username, expiresAt });

  return res.json({
    token,
    expiresAt,
    admin: { id: admin.id, username: admin.username },
  });
});

app.post('/api/admin/auth/logout', authRequired, (req, res) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/admin/dashboard/stats', authRequired, (_req, res) => {
  const managedUserCount = db.prepare('SELECT COUNT(*) as count FROM managed_users').get().count;
  const activeUserCount = db.prepare("SELECT COUNT(*) as count FROM managed_users WHERE status = 'active'").get().count;
  const publishedAnnouncementCount = db.prepare('SELECT COUNT(*) as count FROM system_announcements WHERE published = 1').get().count;

  res.json({
    managedUserCount,
    activeUserCount,
    publishedAnnouncementCount,
  });
});

app.get('/api/admin/users', authRequired, (req, res) => {
  const keyword = String(req.query.keyword || '').trim();
  const rows = keyword
    ? db.prepare('SELECT * FROM managed_users WHERE name LIKE ? OR email LIKE ? ORDER BY id DESC').all(`%${keyword}%`, `%${keyword}%`)
    : db.prepare('SELECT * FROM managed_users ORDER BY id DESC').all();

  res.json(rows);
});

app.post('/api/admin/users', authRequired, (req, res) => {
  const { name, email, role = 'editor', status = 'active' } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ message: 'name 和 email 为必填项' });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO managed_users(name, email, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      )
      .run(name, email, role, status);

    const row = db.prepare('SELECT * FROM managed_users WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(row);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ message: 'email 已存在' });
    }
    return res.status(500).json({ message: '创建用户失败' });
  }
});

app.put('/api/admin/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const { name, email, role, status } = req.body || {};
  const existing = db.prepare('SELECT * FROM managed_users WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: '用户不存在' });
  }

  try {
    db.prepare(
      `UPDATE managed_users
       SET name = ?, email = ?, role = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
    ).run(name ?? existing.name, email ?? existing.email, role ?? existing.role, status ?? existing.status, id);

    const row = db.prepare('SELECT * FROM managed_users WHERE id = ?').get(id);
    return res.json(row);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ message: 'email 已存在' });
    }
    return res.status(500).json({ message: '更新用户失败' });
  }
});

app.delete('/api/admin/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM managed_users WHERE id = ?').run(id);
  if (!result.changes) {
    return res.status(404).json({ message: '用户不存在' });
  }

  return res.json({ success: true });
});

app.get('/api/admin/announcements', authRequired, (_req, res) => {
  const rows = db.prepare('SELECT * FROM system_announcements ORDER BY id DESC').all();
  res.json(rows);
});

app.post('/api/admin/announcements', authRequired, (req, res) => {
  const { title, content, published = 0 } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ message: 'title 和 content 为必填项' });
  }

  const result = db
    .prepare(
      `INSERT INTO system_announcements(title, content, published, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
    )
    .run(title, content, Number(Boolean(published)));

  const row = db.prepare('SELECT * FROM system_announcements WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/admin/announcements/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM system_announcements WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: '公告不存在' });
  }

  const { title, content, published } = req.body || {};
  db.prepare(
    `UPDATE system_announcements
     SET title = ?, content = ?, published = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    title ?? existing.title,
    content ?? existing.content,
    published === undefined ? existing.published : Number(Boolean(published)),
    id,
  );

  const row = db.prepare('SELECT * FROM system_announcements WHERE id = ?').get(id);
  res.json(row);
});

app.delete('/api/admin/announcements/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM system_announcements WHERE id = ?').run(id);
  if (!result.changes) {
    return res.status(404).json({ message: '公告不存在' });
  }

  res.json({ success: true });
});

app.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`后台管理后端服务已启动: http://0.0.0.0:${ADMIN_PORT}`);
  console.log(`默认管理员账号: ${ADMIN_SEED_USERNAME}`);
});
