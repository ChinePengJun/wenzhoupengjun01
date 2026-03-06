import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    img TEXT NOT NULL,
    moq TEXT,
    description TEXT,
    isFeatured INTEGER DEFAULT 0,
    tiers TEXT, -- JSON string
    specs TEXT  -- JSON string
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    title_en TEXT,
    excerpt TEXT NOT NULL,
    excerpt_en TEXT,
    content TEXT,
    content_en TEXT,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    img TEXT NOT NULL
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const initialProducts = [
    { 
      title: "CY CA-1518 定制3D打印环氧树脂防水PET材料手机贴纸流行吻切式包装标签", 
      category: "3D滴胶贴纸", 
      price: "US$0.20-0.23", 
      img: "https://s.alicdn.com/@sc04/kf/H1e4ecf49828942c8aeee85fe6cb532ef1/CY-CA-1518-3D-PET-.jpg?hasNWGrade=1",
      moq: "3000 pieces",
      description: "高透明度、耐黄变、立体感强，适用于电子产品、礼品装饰。采用优质环氧树脂，色彩鲜艳，持久耐用。",
      isFeatured: 1,
      tiers: JSON.stringify([
        { range: "3,000 - 4,999 pieces", price: "US$0.23" },
        { range: "5,000 - 9,999 pieces", price: "US$0.21" },
        { range: ">= 10,000 pieces", price: "US$0.20" }
      ]),
      specs: JSON.stringify({
        color: "Colorful",
        size: "Customized",
        material: "聚乙烯对苯二甲酸酯（塑料）",
        type: "3D Sticker",
        feature: "waterproof",
        printing: "Customized",
        shape: "Customized",
        brand: "CY"
      })
    },
    { 
      title: "批发CY品牌CA-1513型号定制印刷徽标设计3D防水礼品工艺手机壳贴纸A6尺寸PET环氧树脂", 
      category: "3D滴胶贴纸", 
      price: "US$0.20-0.23", 
      img: "https://s.alicdn.com/@sc04/kf/Hb1630189e9a44b0db57da0c63bc03f0fs/-CY-CA-1513-3D-A6-PET.jpg?hasNWGrade=1", 
      moq: "3000 pieces", 
      description: "专业定制印刷，3D立体效果，防水防刮。适用于各类手机壳装饰及礼品包装。",
      isFeatured: 1,
      tiers: "[]", 
      specs: "{}" 
    },
    { 
      title: "定制 A6 尺寸 3D 圆顶凝胶水晶徽标贴纸 UV 印刷防水 UV 装饰手机后盖礼品及工艺品", 
      category: "不干胶标签", 
      price: "US$0.20-0.23", 
      img: "https://s.alicdn.com/@sc04/kf/H9639f9cf7f0b4c418df3e5750eace15fU/-A6-3D-UV-UV-.jpg?hasNWGrade=1", 
      moq: "3000 pieces", 
      description: "UV印刷工艺，色彩还原度高。3D圆顶凝胶增加质感，防水防紫外线。",
      isFeatured: 1,
      tiers: "[]", 
      specs: "{}" 
    },
    { title: "定制时尚3D凝胶标志手机套宠物树脂贴纸DIY不干胶防水圆顶水晶环氧标签包装", category: "3D滴胶贴纸", price: "US$0.20-0.23", img: "https://s.alicdn.com/@sc04/kf/H9639f9cf7f0b4c418df3e5750eace15fU/-A6-3D-UV-UV-.jpg?hasNWGrade=1", moq: "3000 pieces", description: "时尚设计，DIY必备。强力背胶，防水耐用。", isFeatured: 0, tiers: "[]", specs: "{}" },
    { title: "定制环保防水3D树脂环氧A6软胶圆顶PET材料印刷包装标签，适用于礼品工艺贴纸", category: "3D滴胶贴纸", price: "US$0.20-0.23", img: "https://s.alicdn.com/@sc04/kf/H3b21fa3271bb4574958fe2553eb6591cB/-3D-DIY-.jpg?hasNWGrade=1", moq: "3000 pieces", description: "环保PET材质，软胶圆顶手感舒适。适用于各类礼品包装。", isFeatured: 0, tiers: "[]", specs: "{}" },
    { title: "定制徽标 A6 3D PET 贴纸防水防油 UV 印刷全息定制形状圆顶凝胶礼品工艺装饰", category: "3D滴胶贴纸", price: "US$0.20-0.23", img: "https://s.alicdn.com/@sc04/kf/H97d0e262269f474c863bcfada5d6222cH/-3D-A6-PET-.jpg_480x480.jpg?hasNWGrade=1", moq: "3000 pieces", description: "防水防油，全息效果，支持异形定制。提升产品档次。", isFeatured: 0, tiers: "[]", specs: "{}" },
    { title: "CY CA-1502 定制自粘防水3D树脂圆顶环氧贴纸独特形状PET材质包装标签标志", category: "3D滴胶贴纸", price: "US$0.20-0.23", img: "https://s.alicdn.com/@sc04/kf/H8f8c11ed71a74298aa50db6b2593720c8/-A6-3D-PET-UV-.jpg_480x480.jpg?hasNWGrade=1", moq: "3000 pieces", description: "独特形状定制，自粘方便。PET材质稳定，不褪色。", isFeatured: 0, tiers: "[]", specs: "{}" },
    { title: "批发 A6 尺寸 3D PET 凸纹防水手机壳笔记本电脑装饰品可定制印刷模切手机贴纸批量供应", category: "3D滴胶贴纸", price: "US$0.20-0.23", img: "https://s.alicdn.com/@sc04/kf/H66e4ca4b812d45db9e2eead9d85f3dd19/CY-CA-1502-3D-PET-.jpg_480x480.jpg?hasNWGrade=1", moq: "3000 pieces", description: "大批量批发供应，价格优势明显。支持模切定制。", isFeatured: 0, tiers: "[]", specs: "{}" },
  ];

  const insert = db.prepare("INSERT INTO products (title, category, price, img, moq, description, isFeatured, tiers, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const p of initialProducts) {
    insert.run(p.title, p.category, p.price, p.img, p.moq, p.description, p.isFeatured, p.tiers, p.specs);
  }
}

const newsCount = db.prepare("SELECT COUNT(*) as count FROM news").get() as { count: number };
if (newsCount.count === 0) {
  const initialNews = [
    {
      title: "云浠包装参加 2024 上海国际包装展览会",
      title_en: "Yunxi Packaging Participates in 2024 Shanghai International Packaging Exhibition",
      excerpt: "我们将展示最新的 3D 滴胶技术与环保包装解决方案，诚邀各位合作伙伴莅临指导。",
      excerpt_en: "We will showcase the latest 3D epoxy technology and eco-friendly packaging solutions. Welcome partners to visit.",
      category: "公司动态",
      author: "云浠新闻中心",
      date: "2024-03-15",
      img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "如何选择适合您品牌的不干胶标签材质？",
      title_en: "How to Choose the Right Adhesive Label Material for Your Brand?",
      excerpt: "从耐候性、粘性到视觉效果，深度解析各类工业标签材质的优缺点。",
      excerpt_en: "Deep analysis of the pros and cons of various industrial label materials from weather resistance to visual effects.",
      category: "行业资讯",
      author: "行业观察员",
      date: "2024-03-10",
      img: "https://images.unsplash.com/photo-1626863905121-3b0c0ed7b94c?auto=format&fit=crop&q=80&w=800"
    }
  ];
  const insertNews = db.prepare("INSERT INTO news (title, title_en, excerpt, excerpt_en, category, author, date, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  for (const n of initialNews) {
    insertNews.run(n.title, n.title_en, n.excerpt, n.excerpt_en, n.category, n.author, n.date, n.img);
  }
}

const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
if (settingsCount.count === 0) {
  const initialSettings = [
    { key: "companyName", value: "云浠包装" },
    { key: "companyNameEn", value: "CY STICKER" },
    { key: "phone", value: "+86 123 4567 8900" },
    { key: "email", value: "sales@cysticker.com" },
    { key: "address", value: "广东省温州市龙港市某某工业园" },
    { key: "seoTitle", value: "云浠包装 | 专业3D滴胶贴纸与不干胶标签定制厂家" },
    { key: "seoKeywords", value: "3D滴胶贴纸, 不干胶标签, 定制包装, 云浠包装" },
    { key: "seoDescription", value: "温州云浠包装有限公司专注于高品质3D滴胶贴纸、不干胶标签及各类定制包装盒的研发与生产，为您提供一站式包装解决方案。" }
  ];
  const insertSetting = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
  for (const s of initialSettings) {
    insertSetting.run(s.key, JSON.stringify(s.value));
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products.map((p: any) => ({
      ...p,
      tiers: JSON.parse(p.tiers || "[]"),
      specs: JSON.parse(p.specs || "{}")
    })));
  });

  app.post("/api/products", (req, res) => {
    const { id, title, category, price, img, moq, description, isFeatured, tiers, specs } = req.body;
    if (id) {
      db.prepare("UPDATE products SET title = ?, category = ?, price = ?, img = ?, moq = ?, description = ?, isFeatured = ?, tiers = ?, specs = ? WHERE id = ?")
        .run(title, category, price, img, moq, description, isFeatured ? 1 : 0, JSON.stringify(tiers), JSON.stringify(specs), id);
      res.json({ success: true, id });
    } else {
      const result = db.prepare("INSERT INTO products (title, category, price, img, moq, description, isFeatured, tiers, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(title, category, price, img, moq, description, isFeatured ? 1 : 0, JSON.stringify(tiers), JSON.stringify(specs));
      res.json({ success: true, id: result.lastInsertRowid });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // News Routes
  app.get("/api/news", (req, res) => {
    const news = db.prepare("SELECT * FROM news ORDER BY date DESC").all();
    res.json(news);
  });

  app.post("/api/news", (req, res) => {
    const { id, title, title_en, excerpt, excerpt_en, category, author, date, img } = req.body;
    if (id) {
      db.prepare("UPDATE news SET title = ?, title_en = ?, excerpt = ?, excerpt_en = ?, category = ?, author = ?, date = ?, img = ? WHERE id = ?")
        .run(title, title_en, excerpt, excerpt_en, category, author, date, img, id);
      res.json({ success: true, id });
    } else {
      const result = db.prepare("INSERT INTO news (title, title_en, excerpt, excerpt_en, category, author, date, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(title, title_en, excerpt, excerpt_en, category, author, date, img);
      res.json({ success: true, id: result.lastInsertRowid });
    }
  });

  app.delete("/api/news/:id", (req, res) => {
    db.prepare("DELETE FROM news WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Inquiry Routes
  app.get("/api/inquiries", (req, res) => {
    const inquiries = db.prepare("SELECT * FROM inquiries ORDER BY createdAt DESC").all();
    res.json(inquiries);
  });

  app.post("/api/inquiries", (req, res) => {
    const { name, email, phone, content } = req.body;
    const result = db.prepare("INSERT INTO inquiries (name, email, phone, content) VALUES (?, ?, ?, ?)")
      .run(name, email, phone, content);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.delete("/api/inquiries/:id", (req, res) => {
    db.prepare("DELETE FROM inquiries WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });
  
  app.post("/api/inquiries/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM site_settings").all();
    const result: any = {};
    settings.forEach((s: any) => {
      result[s.key] = JSON.parse(s.value);
    });
    res.json(result);
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)")
      .run(key, JSON.stringify(value));
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
