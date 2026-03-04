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
const ALLOWED_ORIGIN = process.env.ADMIN_CORS_ORIGIN || '*';

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

    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      price TEXT NOT NULL,
      img TEXT NOT NULL,
      moq TEXT NOT NULL DEFAULT '1000 片',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES product_categories(id)
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

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM product_categories').get().count;
  if (!categoryCount) {
    const categoryNames = ['3D滴胶贴纸', '不干胶标签', '纸袋、包装盒定制'];
    const insertCategory = db.prepare(
      `INSERT INTO product_categories(name, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))`,
    );
    for (const name of categoryNames) insertCategory.run(name);
  }

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (!productCount) {
    const categoryByName = db.prepare('SELECT id FROM product_categories WHERE name = ?');
    const products = [
      {
        title: 'CY CA-1518 定制3D打印环氧树脂防水PET材料手机贴纸流行吻切式包装标签',
        category: '3D滴胶贴纸',
        price: 'US$0.20-0.23',
        img: 'https://s.alicdn.com/@sc04/kf/H1e4ecf49828942c8aeee85fe6cb532ef1/CY-CA-1518-3D-PET-.jpg?hasNWGrade=1',
        moq: '3000 pieces',
      },
      {
        title: '批发CY品牌CA-1513型号定制印刷徽标设计3D防水礼品工艺手机壳贴纸A6尺寸PET环氧树脂',
        category: '3D滴胶贴纸',
        price: 'US$0.20-0.30',
        img: 'https://s.alicdn.com/@sc04/kf/Hb1630189e9a44b0db57da0c63bc03f0fs/-CY-CA-1513-3D-A6-PET.jpg?hasNWGrade=1',
        moq: '3000 pieces',
      },
      {
        title: '定制 A6 尺寸 3D 圆顶凝胶水晶徽标贴纸 UV 印刷防水 UV 装饰手机后盖礼品及工艺品',
        category: '不干胶标签',
        price: 'US$0.18-0.28',
        img: 'https://s.alicdn.com/@sc04/kf/H9639f9cf7f0b4c418df3e5750eace15fU/-A6-3D-UV-UV-.jpg?hasNWGrade=1',
        moq: '3000 pieces',
      },
    ];

    const insertProduct = db.prepare(
      `INSERT INTO products(title, category_id, price, img, moq, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
    );
    for (const item of products) {
      const category = categoryByName.get(item.category);
      if (category) {
        insertProduct.run(item.title, category.id, item.price, item.img, item.moq);
      }
    }
  }
}

function authRequired(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: '缺少管理员令牌' });

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
    if (session.expiresAt < now) sessions.delete(token);
  }
}

function getCatalog() {
  const categories = db.prepare('SELECT id, name FROM product_categories ORDER BY id ASC').all();
  const products = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.status, p.category_id as categoryId, c.name as category
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       ORDER BY p.id DESC`,
    )
    .all();
  return { categories, products };
}

initDatabase();
setInterval(pruneSessions, 10 * 60 * 1000).unref();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
});

app.get('/api/admin/health', (_req, res) => {
  res.json({ ok: true, service: 'admin-backend', time: new Date().toISOString() });
});

app.get('/api/catalog', (_req, res) => {
  const catalog = getCatalog();
  res.json({
    categories: catalog.categories,
    products: catalog.products.filter((p) => p.status === 'active'),
  });
});

app.post('/api/admin/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: '用户名和密码不能为空' });

  const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username);
  if (!admin || admin.password_hash !== hashPassword(password)) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = newSessionToken();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, { id: admin.id, username: admin.username, expiresAt });
  return res.json({ token, expiresAt, admin: { id: admin.id, username: admin.username } });
});

app.post('/api/admin/auth/logout', authRequired, (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/admin/dashboard/stats', authRequired, (_req, res) => {
  const managedUserCount = db.prepare('SELECT COUNT(*) as count FROM managed_users').get().count;
  const activeUserCount = db.prepare("SELECT COUNT(*) as count FROM managed_users WHERE status = 'active'").get().count;
  const publishedAnnouncementCount = db.prepare('SELECT COUNT(*) as count FROM system_announcements WHERE published = 1').get().count;
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM product_categories').get().count;
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get().count;

  res.json({ managedUserCount, activeUserCount, publishedAnnouncementCount, categoryCount, productCount });
});

app.get('/api/admin/categories', authRequired, (_req, res) => {
  const rows = db.prepare('SELECT id, name, created_at, updated_at FROM product_categories ORDER BY id ASC').all();
  res.json(rows);
});

app.post('/api/admin/categories', authRequired, (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ message: '分类名称不能为空' });
  try {
    const result = db
      .prepare(`INSERT INTO product_categories(name, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))`)
      .run(name.trim());
    const row = db.prepare('SELECT id, name, created_at, updated_at FROM product_categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ message: '分类已存在' });
    res.status(500).json({ message: '创建分类失败' });
  }
});

app.put('/api/admin/categories/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ message: '分类名称不能为空' });
  const existing = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: '分类不存在' });

  try {
    db.prepare(`UPDATE product_categories SET name = ?, updated_at = datetime('now') WHERE id = ?`).run(name.trim(), id);
    const row = db.prepare('SELECT id, name, created_at, updated_at FROM product_categories WHERE id = ?').get(id);
    res.json(row);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ message: '分类已存在' });
    res.status(500).json({ message: '更新分类失败' });
  }
});

app.delete('/api/admin/categories/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const inUse = db.prepare('SELECT id FROM products WHERE category_id = ? LIMIT 1').get(id);
  if (inUse) return res.status(400).json({ message: '该分类下存在产品，请先删除或转移产品' });
  const result = db.prepare('DELETE FROM product_categories WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ message: '分类不存在' });
  res.json({ success: true });
});

app.get('/api/admin/products', authRequired, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.status, p.category_id as categoryId, c.name as category,
              p.created_at, p.updated_at
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       ORDER BY p.id DESC`,
    )
    .all();
  res.json(rows);
});

app.post('/api/admin/products', authRequired, (req, res) => {
  const { title, categoryId, price, img, moq = '1000 片', status = 'active' } = req.body || {};
  if (!title || !categoryId || !price || !img) return res.status(400).json({ message: 'title/categoryId/price/img 为必填项' });
  const category = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(Number(categoryId));
  if (!category) return res.status(400).json({ message: '分类不存在' });

  const result = db
    .prepare(
      `INSERT INTO products(title, category_id, price, img, moq, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
    .run(title, Number(categoryId), price, img, moq, status === 'disabled' ? 'disabled' : 'active');

  const row = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.status, p.category_id as categoryId, c.name as category,
              p.created_at, p.updated_at
       FROM products p INNER JOIN product_categories c ON c.id = p.category_id
       WHERE p.id = ?`,
    )
    .get(result.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/admin/products/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: '产品不存在' });

  const { title, categoryId, price, img, moq, status } = req.body || {};
  const targetCategoryId = Number(categoryId ?? existing.category_id);
  const category = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(targetCategoryId);
  if (!category) return res.status(400).json({ message: '分类不存在' });

  db.prepare(
    `UPDATE products
     SET title = ?, category_id = ?, price = ?, img = ?, moq = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    title ?? existing.title,
    targetCategoryId,
    price ?? existing.price,
    img ?? existing.img,
    moq ?? existing.moq,
    status ?? existing.status,
    id,
  );

  const row = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.status, p.category_id as categoryId, c.name as category,
              p.created_at, p.updated_at
       FROM products p INNER JOIN product_categories c ON c.id = p.category_id
       WHERE p.id = ?`,
    )
    .get(id);
  res.json(row);
});

app.delete('/api/admin/products/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ message: '产品不存在' });
  res.json({ success: true });
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
  if (!name || !email) return res.status(400).json({ message: 'name 和 email 为必填项' });

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
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ message: 'email 已存在' });
    return res.status(500).json({ message: '创建用户失败' });
  }
});

app.put('/api/admin/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const { name, email, role, status } = req.body || {};
  const existing = db.prepare('SELECT * FROM managed_users WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: '用户不存在' });

  try {
    db.prepare(
      `UPDATE managed_users
       SET name = ?, email = ?, role = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
    ).run(name ?? existing.name, email ?? existing.email, role ?? existing.role, status ?? existing.status, id);

    const row = db.prepare('SELECT * FROM managed_users WHERE id = ?').get(id);
    return res.json(row);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ message: 'email 已存在' });
    return res.status(500).json({ message: '更新用户失败' });
  }
});

app.delete('/api/admin/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM managed_users WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ message: '用户不存在' });
  return res.json({ success: true });
});

app.get('/api/admin/announcements', authRequired, (_req, res) => {
  const rows = db.prepare('SELECT * FROM system_announcements ORDER BY id DESC').all();
  res.json(rows);
});

app.post('/api/admin/announcements', authRequired, (req, res) => {
  const { title, content, published = 0 } = req.body || {};
  if (!title || !content) return res.status(400).json({ message: 'title 和 content 为必填项' });

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
  if (!existing) return res.status(404).json({ message: '公告不存在' });

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
  if (!result.changes) return res.status(404).json({ message: '公告不存在' });
  res.json({ success: true });
});

app.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`后台管理后端服务已启动: http://0.0.0.0:${ADMIN_PORT}`);
  console.log(`默认管理员账号: ${ADMIN_SEED_USERNAME}`);
});
