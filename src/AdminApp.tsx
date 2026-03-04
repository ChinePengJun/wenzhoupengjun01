import { FormEvent, useEffect, useMemo, useState } from 'react';

type Category = { id: number; name: string };
type Product = {
  id: number;
  title: string;
  categoryId: number;
  category: string;
  price: string;
  img: string;
  moq: string;
  status: string;
  description?: string;
  specs?: Record<string, string>;
  tiers?: Array<{ range: string; price: string }>;
  thumbnails?: string[];
};

type Stats = {
  managedUserCount: number;
  activeUserCount: number;
  publishedAnnouncementCount: number;
  categoryCount?: number;
  productCount?: number;
};

const configuredBase = (import.meta.env.VITE_ADMIN_API_BASE || '').replace(/\/$/, '');
const apiBases = configuredBase ? [configuredBase] : ['', 'http://localhost:3000'];

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let lastError: unknown;
  for (const base of apiBases) {
    try {
      const res = await fetch(`${base}${path}`, { ...options, headers });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || `请求失败(${res.status})`);
      }
      return res.json() as Promise<T>;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('接口请求失败');
}

const cardCls = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
const btnCls = 'rounded-xl px-3 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 transition';
const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300';

export default function AdminApp() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({ title: '', categoryId: '', price: '', img: '', moq: '1000 片', thumbnails: '' });
  const [error, setError] = useState('');
  const [siteSettings, setSiteSettings] = useState({
    companyName: '云浠（温州）包装有限公司',
    address: '浙江省温州龙港市启源路2356-2400',
    phone: '+86-131 6635 1888',
    email: 'wzyunxipack@qq.com',
    copyright: '© 云浠（温州）包装有限公司 版权所有',
  });

  const activeProducts = useMemo(() => products.filter((p) => p.status === 'active').length, [products]);

  async function reload(nextToken: string) {
    const [s, c, p, settings] = await Promise.all([
      request<Stats>('/api/admin/dashboard/stats', {}, nextToken),
      request<Category[]>('/api/admin/categories', {}, nextToken),
      request<Product[]>('/api/admin/products', {}, nextToken),
      request<Record<string, string>>('/api/admin/site-settings', {}, nextToken),
    ]);
    setStats(s);
    setCategories(c);
    setProducts(p);
    setSiteSettings((prev) => ({ ...prev, ...settings }));
  }

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    reload(token).catch((err: Error) => setError(err.message));
  }, [token]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await request<{ token: string }>('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onLogout() {
    try {
      await request('/api/admin/auth/logout', { method: 'POST' }, token);
    } catch {}
    setToken('');
    localStorage.removeItem('admin_token');
  }

  async function createCategory(e: FormEvent) {
    e.preventDefault();
    try {
      await request('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name: categoryName }) }, token);
      setCategoryName('');
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateCategory(id: number, currentName: string) {
    const nextName = window.prompt('请输入新的分类名称', currentName);
    if (!nextName || !nextName.trim()) return;
    try {
      await request(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name: nextName.trim() }) }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeCategory(id: number) {
    if (!window.confirm('确认删除该分类？')) return;
    try {
      await request(`/api/admin/categories/${id}`, { method: 'DELETE' }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    try {
      await request('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          title: newProduct.title,
          categoryId: Number(newProduct.categoryId),
          price: newProduct.price,
          img: newProduct.img,
          moq: newProduct.moq,
          thumbnails: newProduct.thumbnails.split(',').map((x) => x.trim()).filter(Boolean),
          status: 'active',
        }),
      }, token);
      setNewProduct({ title: '', categoryId: '', price: '', img: '', moq: '1000 片', thumbnails: '' });
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleProductStatus(item: Product) {
    try {
      await request(`/api/admin/products/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: item.status === 'active' ? 'disabled' : 'active' }),
      }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeProduct(id: number) {
    if (!window.confirm('确认删除该产品？')) return;
    try {
      await request(`/api/admin/products/${id}`, { method: 'DELETE' }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function moveProductCategory(item: Product) {
    const categoryId = window.prompt(`请输入新的分类ID（当前：${item.categoryId}）`, String(item.categoryId));
    if (!categoryId) return;
    try {
      await request(`/api/admin/products/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ categoryId: Number(categoryId) }),
      }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }



  async function saveSiteSettings(e: FormEvent) {
    e.preventDefault();
    try {
      await request('/api/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettings),
      }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function editProductDetail(item: Product) {
    const description = window.prompt('产品详情描述（显示在详情页）', item.description || '');
    if (description === null) return;

    const specsText = window.prompt(
      '产品规格 JSON（例如 {"material":"PET","brand":"CY"}）',
      JSON.stringify(item.specs || {}, null, 2),
    );
    if (specsText === null) return;

    const tiersText = window.prompt(
      '价格阶梯 JSON（例如 [{\"range\":\"1000-3000\",\"price\":\"US$0.2\"}]）',
      JSON.stringify(item.tiers || [], null, 2),
    );
    if (tiersText === null) return;

    const thumbnailsText = window.prompt(
      '详情缩略图 JSON（例如 [\"https://a.jpg\",\"https://b.jpg\"]）',
      JSON.stringify(item.thumbnails || [], null, 2),
    );
    if (thumbnailsText === null) return;

    try {
      await request(`/api/admin/products/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          description,
          specs: JSON.parse(specsText),
          tiers: JSON.parse(tiersText),
          thumbnails: JSON.parse(thumbnailsText),
        }),
      }, token);
      await reload(token);
    } catch (err) {
      setError(`产品详情更新失败：${(err as Error).message}`);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-black text-slate-900 mb-1">后台管理系统</h1>
          <p className="text-sm text-slate-500 mb-6">登录后可直接管理前台分类与产品内容</p>
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <form onSubmit={onLogin} className="space-y-3">
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
            <button className={`${btnCls} w-full`} type="submit">登录</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">后台管理控制台</h1>
            <p className="text-sm text-slate-500">支持分类、产品、产品详情缩略图、联系方式与版权一体化管理</p>
          </div>
          <button className={btnCls} onClick={onLogout}>退出登录</button>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">错误：{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className={cardCls}><p className="text-xs text-slate-500">分类总数</p><p className="text-2xl font-black">{stats?.categoryCount ?? categories.length}</p></div>
          <div className={cardCls}><p className="text-xs text-slate-500">产品总数</p><p className="text-2xl font-black">{stats?.productCount ?? products.length}</p></div>
          <div className={cardCls}><p className="text-xs text-slate-500">上架产品</p><p className="text-2xl font-black">{activeProducts}</p></div>
          <div className={cardCls}><p className="text-xs text-slate-500">管理用户</p><p className="text-2xl font-black">{stats?.managedUserCount ?? 0}</p></div>
          <div className={cardCls}><p className="text-xs text-slate-500">已发布公告</p><p className="text-2xl font-black">{stats?.publishedAnnouncementCount ?? 0}</p></div>
        </div>

        <section className={cardCls}>
          <h2 className="text-lg font-bold mb-3">站点信息设置（影响前台）</h2>
          <form onSubmit={saveSiteSettings} className="grid md:grid-cols-2 gap-2 mb-2">
            <input className={inputCls} value={siteSettings.companyName} onChange={(e) => setSiteSettings((v) => ({ ...v, companyName: e.target.value }))} placeholder="公司名称" />
            <input className={inputCls} value={siteSettings.phone} onChange={(e) => setSiteSettings((v) => ({ ...v, phone: e.target.value }))} placeholder="电话" />
            <input className={inputCls} value={siteSettings.email} onChange={(e) => setSiteSettings((v) => ({ ...v, email: e.target.value }))} placeholder="邮箱" />
            <input className={inputCls} value={siteSettings.address} onChange={(e) => setSiteSettings((v) => ({ ...v, address: e.target.value }))} placeholder="地址" />
            <input className={inputCls + ' md:col-span-2'} value={siteSettings.copyright} onChange={(e) => setSiteSettings((v) => ({ ...v, copyright: e.target.value }))} placeholder="版权信息" />
            <button className={btnCls + ' md:col-span-2 w-fit'} type="submit">保存站点信息</button>
          </form>
        </section>

        <section className={cardCls}>
          <h2 className="text-lg font-bold mb-3">分类管理</h2>
          <form onSubmit={createCategory} className="flex flex-col md:flex-row gap-2 mb-4">
            <input className={inputCls} required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="新分类名称" />
            <button className={btnCls} type="submit">新增分类</button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500"><tr><th className="py-2">ID</th><th>分类名</th><th>操作</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="py-2">{c.id}</td><td>{c.name}</td>
                    <td className="space-x-2">
                      <button className="rounded-lg bg-slate-100 px-2 py-1" onClick={() => updateCategory(c.id, c.name)}>重命名</button>
                      <button className="rounded-lg bg-red-50 text-red-600 px-2 py-1" onClick={() => removeCategory(c.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={cardCls}>
          <h2 className="text-lg font-bold mb-3">产品管理</h2>
          <form onSubmit={createProduct} className="grid gap-2 mb-4">
            <input className={inputCls} required value={newProduct.title} onChange={(e) => setNewProduct((v) => ({ ...v, title: e.target.value }))} placeholder="产品标题" />
            <div className="grid md:grid-cols-3 gap-2">
              <select className={inputCls} required value={newProduct.categoryId} onChange={(e) => setNewProduct((v) => ({ ...v, categoryId: e.target.value }))}>
                <option value="">选择分类</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className={inputCls} required value={newProduct.price} onChange={(e) => setNewProduct((v) => ({ ...v, price: e.target.value }))} placeholder="价格（US$0.2-0.4）" />
              <input className={inputCls} value={newProduct.moq} onChange={(e) => setNewProduct((v) => ({ ...v, moq: e.target.value }))} placeholder="起订量" />
            </div>
            <input className={inputCls} required value={newProduct.img} onChange={(e) => setNewProduct((v) => ({ ...v, img: e.target.value }))} placeholder="主图 URL" />
            <input className={inputCls} value={newProduct.thumbnails} onChange={(e) => setNewProduct((v) => ({ ...v, thumbnails: e.target.value }))} placeholder="详情缩略图 URL（多个用逗号分隔）" />
            <button className={`${btnCls} w-fit`} type="submit">新增产品</button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr><th className="py-2">ID</th><th>标题</th><th>分类</th><th>价格</th><th>状态</th><th>操作</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 align-top">
                    <td className="py-2">{p.id}</td>
                    <td className="max-w-xs">{p.title}</td>
                    <td>{p.category}</td>
                    <td>{p.price}</td>
                    <td><span className={`rounded-full px-2 py-1 text-xs ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span></td>
                    <td className="space-x-2">
                      <button className="rounded-lg bg-slate-100 px-2 py-1" onClick={() => moveProductCategory(p)}>改分类</button>
                      <button className="rounded-lg bg-amber-50 text-amber-700 px-2 py-1" onClick={() => editProductDetail(p)}>编辑详情</button>
                      <button className="rounded-lg bg-indigo-50 text-indigo-700 px-2 py-1" onClick={() => toggleProductStatus(p)}>{p.status === 'active' ? '下架' : '上架'}</button>
                      <button className="rounded-lg bg-red-50 text-red-600 px-2 py-1" onClick={() => removeProduct(p.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
