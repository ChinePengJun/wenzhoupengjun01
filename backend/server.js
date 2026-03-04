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
const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const uploadsDir = path.join(projectRoot, 'data', 'uploads');

const DB_FILE = process.env.ADMIN_DB_PATH || path.join(projectRoot, 'data', 'admin.db');
const ADMIN_PORT = Number(process.env.ADMIN_PORT || 3000);
const ADMIN_SEED_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_SEED_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const ALLOWED_ORIGIN = process.env.ADMIN_CORS_ORIGIN || '*';

const DEFAULT_SITE_SETTINGS = {
  companyName: '云浠（温州）包装有限公司',
  address: '浙江省温州龙港市启源路2356-2400',
  phone: '+86-131 6635 1888',
  email: 'wzyunxipack@qq.com',
  copyright: '© 云浠（温州）包装有限公司 版权所有',
};

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
const db = new Database(DB_FILE);

const sessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function safeParseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function enrichProduct(product) {
  return {
    ...product,
    specs: safeParseJson(product.specs_json, {}),
    tiers: safeParseJson(product.tiers_json, []),
    thumbnails: safeParseJson(product.thumbnails_json, []),
    videoUrl: product.video_url || '',
  };
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
      description TEXT NOT NULL DEFAULT '',
      specs_json TEXT NOT NULL DEFAULT '{}',
      tiers_json TEXT NOT NULL DEFAULT '[]',
      thumbnails_json TEXT NOT NULL DEFAULT '[]',
      video_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES product_categories(id)
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration for old DB
  try { db.exec("ALTER TABLE products ADD COLUMN description TEXT NOT NULL DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE products ADD COLUMN specs_json TEXT NOT NULL DEFAULT '{}'"); } catch {}
  try { db.exec("ALTER TABLE products ADD COLUMN tiers_json TEXT NOT NULL DEFAULT '[]'"); } catch {}
  try { db.exec("ALTER TABLE products ADD COLUMN thumbnails_json TEXT NOT NULL DEFAULT '[]'"); } catch {}
  try { db.exec("ALTER TABLE products ADD COLUMN video_url TEXT NOT NULL DEFAULT ''"); } catch {}

  const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get(ADMIN_SEED_USERNAME);
  if (!adminExists) {
    db.prepare('INSERT INTO admins(username, password_hash) VALUES (?, ?)').run(
      ADMIN_SEED_USERNAME,
      hashPassword(ADMIN_SEED_PASSWORD),
    );
    console.log(`[admin] 已初始化默认管理员: ${ADMIN_SEED_USERNAME}`);
  }

  const upsertSetting = db.prepare(`
    INSERT INTO site_settings(key, value, updated_at)
    VALUES (@key, @value, datetime('now'))
    ON CONFLICT(key) DO NOTHING
  `);
  Object.entries(DEFAULT_SITE_SETTINGS).forEach(([key, value]) => upsertSetting.run({ key, value }));

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM product_categories').get().count;
  if (!categoryCount) {
    ['3D滴胶贴纸', '不干胶标签', '纸袋、包装盒定制'].forEach((name) => {
      db.prepare(`INSERT INTO product_categories(name, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))`).run(name);
    });
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
        description: '面向礼品与工艺包装场景的高品质滴胶贴纸。',
      },
      {
        title: '批发CY品牌CA-1513型号定制印刷徽标设计3D防水礼品工艺手机壳贴纸A6尺寸PET环氧树脂',
        category: '3D滴胶贴纸',
        price: 'US$0.20-0.30',
        img: 'https://s.alicdn.com/@sc04/kf/Hb1630189e9a44b0db57da0c63bc03f0fs/-CY-CA-1513-3D-A6-PET.jpg?hasNWGrade=1',
        moq: '3000 pieces',
        description: '支持 LOGO、尺寸、工艺全定制。',
      },
      {
        title: '定制 A6 尺寸 3D 圆顶凝胶水晶徽标贴纸 UV 印刷防水 UV 装饰手机后盖礼品及工艺品',
        category: '不干胶标签',
        price: 'US$0.18-0.28',
        img: 'https://s.alicdn.com/@sc04/kf/H9639f9cf7f0b4c418df3e5750eace15fU/-A6-3D-UV-UV-.jpg?hasNWGrade=1',
        moq: '3000 pieces',
        description: '适用于品牌标签、促销礼品与包装装饰。',
      },
    ];

    const insertProduct = db.prepare(
      `INSERT INTO products(title, category_id, price, img, moq, description, specs_json, tiers_json, thumbnails_json, video_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, '{}', '[]', '[]', '', 'active', datetime('now'), datetime('now'))`,
    );

    products.forEach((item) => {
      const category = categoryByName.get(item.category);
      if (category) insertProduct.run(item.title, category.id, item.price, item.img, item.moq, item.description);
    });
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

function getSiteSettings() {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  const fromDb = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return { ...DEFAULT_SITE_SETTINGS, ...fromDb };
}

function getCatalog() {
  const categories = db.prepare('SELECT id, name FROM product_categories ORDER BY id ASC').all();
  const products = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.description, p.specs_json, p.tiers_json, p.thumbnails_json, p.video_url, p.status,
              p.category_id as categoryId, c.name as category
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       ORDER BY p.id DESC`,
    )
    .all()
    .map(enrichProduct);

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

app.get('/api/site-settings', (_req, res) => {
  res.json(getSiteSettings());
});


app.post('/api/admin/upload', authRequired, (req, res) => {
  const { filename, dataUrl } = req.body || {};
  if (!filename || !dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ message: 'filename 和 dataUrl 为必填项' });
  }

  const match = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);
  if (!match) return res.status(400).json({ message: 'dataUrl 格式无效' });

  const ext = path.extname(String(filename)).toLowerCase() || '.bin';
  const safeExt = ext.replace(/[^a-z0-9.]/gi, '') || '.bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
  const fullPath = path.join(uploadsDir, fileName);

  try {
    fs.writeFileSync(fullPath, Buffer.from(match[2], 'base64'));
    return res.json({ url: `/uploads/${fileName}`, fileName });
  } catch {
    return res.status(500).json({ message: '文件保存失败' });
  }
});

app.get('/api/catalog', (_req, res) => {
  const catalog = getCatalog();
  res.json({
    categories: catalog.categories,
    products: catalog.products.filter((item) => item.status === 'active'),
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

app.get('/api/admin/site-settings', authRequired, (_req, res) => {
  res.json(getSiteSettings());
});

app.put('/api/admin/site-settings', authRequired, (req, res) => {
  const payload = req.body || {};
  const upsert = db.prepare(
    `INSERT INTO site_settings(key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
  );

  for (const key of Object.keys(DEFAULT_SITE_SETTINGS)) {
    if (payload[key] !== undefined) {
      upsert.run(key, String(payload[key] ?? ''));
    }
  }

  res.json(getSiteSettings());
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
      .prepare('INSERT INTO product_categories(name, created_at, updated_at) VALUES (?, datetime(\'now\'), datetime(\'now\'))')
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
    db.prepare('UPDATE product_categories SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name.trim(), id);
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
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.description, p.specs_json, p.tiers_json, p.thumbnails_json, p.video_url, p.status,
              p.category_id as categoryId, c.name as category, p.created_at, p.updated_at
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       ORDER BY p.id DESC`,
    )
    .all()
    .map(enrichProduct);
  res.json(rows);
});

app.post('/api/admin/products', authRequired, (req, res) => {
  const {
    title,
    categoryId,
    price,
    img,
    moq = '1000 片',
    description = '',
    specs = {},
    tiers = [],
    thumbnails = [],
    videoUrl = '',
    status = 'active',
  } = req.body || {};

  if (!title || !categoryId || !price || !img) {
    return res.status(400).json({ message: 'title/categoryId/price/img 为必填项' });
  }

  const category = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(Number(categoryId));
  if (!category) return res.status(400).json({ message: '分类不存在' });

  const result = db
    .prepare(
      `INSERT INTO products(title, category_id, price, img, moq, description, specs_json, tiers_json, thumbnails_json, video_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
    .run(
      title,
      Number(categoryId),
      price,
      img,
      moq,
      description,
      JSON.stringify(specs || {}),
      JSON.stringify(Array.isArray(tiers) ? tiers : []),
      JSON.stringify(Array.isArray(thumbnails) ? thumbnails : []),
      String(videoUrl || ''),
      status === 'disabled' ? 'disabled' : 'active',
    );

  const row = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.description, p.specs_json, p.tiers_json, p.thumbnails_json, p.video_url, p.status,
              p.category_id as categoryId, c.name as category, p.created_at, p.updated_at
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       WHERE p.id = ?`,
    )
    .get(result.lastInsertRowid);

  res.status(201).json(enrichProduct(row));
});

app.put('/api/admin/products/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: '产品不存在' });

  const { title, categoryId, price, img, moq, description, specs, tiers, thumbnails, videoUrl, status } = req.body || {};
  const targetCategoryId = Number(categoryId ?? existing.category_id);
  const category = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(targetCategoryId);
  if (!category) return res.status(400).json({ message: '分类不存在' });

  db.prepare(
    `UPDATE products
     SET title = ?, category_id = ?, price = ?, img = ?, moq = ?, description = ?, specs_json = ?, tiers_json = ?, thumbnails_json = ?, video_url = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    title ?? existing.title,
    targetCategoryId,
    price ?? existing.price,
    img ?? existing.img,
    moq ?? existing.moq,
    description ?? existing.description,
    specs === undefined ? existing.specs_json : JSON.stringify(specs || {}),
    tiers === undefined ? existing.tiers_json : JSON.stringify(Array.isArray(tiers) ? tiers : []),
    thumbnails === undefined ? existing.thumbnails_json : JSON.stringify(Array.isArray(thumbnails) ? thumbnails : []),
    videoUrl ?? existing.video_url,
    status ?? existing.status,
    id,
  );

  const row = db
    .prepare(
      `SELECT p.id, p.title, p.price, p.img, p.moq, p.description, p.specs_json, p.tiers_json, p.thumbnails_json, p.video_url, p.status,
              p.category_id as categoryId, c.name as category, p.created_at, p.updated_at
       FROM products p INNER JOIN product_categories c ON c.id = p.category_id
       WHERE p.id = ?`,
    )
    .get(id);

  res.json(enrichProduct(row));
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

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(distDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (fs.existsSync(indexHtmlPath)) return res.sendFile(indexHtmlPath);
  return res.status(503).send('前端构建文件不存在，请先执行 npm run build');
});

app.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`后台管理后端服务已启动: http://0.0.0.0:${ADMIN_PORT}`);
  console.log(`默认管理员账号: ${ADMIN_SEED_USERNAME}`);
});
