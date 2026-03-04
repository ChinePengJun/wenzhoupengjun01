import { FormEvent, useEffect, useState } from 'react';

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
};

type Stats = {
  managedUserCount: number;
  activeUserCount: number;
  publishedAnnouncementCount: number;
  categoryCount?: number;
  productCount?: number;
};

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE || '').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.message || `请求失败(${res.status})`);
  }
  return res.json() as Promise<T>;
}

export default function AdminApp() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({ title: '', categoryId: '', price: '', img: '', moq: '1000 片' });
  const [error, setError] = useState('');

  async function reload(nextToken: string) {
    const [s, c, p] = await Promise.all([
      request<Stats>('/api/admin/dashboard/stats', {}, nextToken),
      request<Category[]>('/api/admin/categories', {}, nextToken),
      request<Product[]>('/api/admin/products', {}, nextToken),
    ]);
    setStats(s);
    setCategories(c);
    setProducts(p);
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
          status: 'active',
        }),
      }, token);
      setNewProduct({ title: '', categoryId: '', price: '', img: '', moq: '1000 片' });
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

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
        <h1>后台管理登录</h1>
        {error && <p style={{ color: '#c00' }}>{error}</p>}
        <form onSubmit={onLogin} style={{ display: 'grid', gap: 10 }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
          <button type="submit">登录</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>后台管理系统</h1>
        <button onClick={onLogout}>退出登录</button>
      </div>
      {error && <p style={{ color: '#c00' }}>错误：{error}</p>}

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(5, minmax(0,1fr))', marginBottom: 20 }}>
        <div style={{ border: '1px solid #ddd', padding: 10 }}>分类数：{stats?.categoryCount ?? 0}</div>
        <div style={{ border: '1px solid #ddd', padding: 10 }}>产品数：{stats?.productCount ?? 0}</div>
        <div style={{ border: '1px solid #ddd', padding: 10 }}>管理用户：{stats?.managedUserCount ?? 0}</div>
        <div style={{ border: '1px solid #ddd', padding: 10 }}>活跃用户：{stats?.activeUserCount ?? 0}</div>
        <div style={{ border: '1px solid #ddd', padding: 10 }}>已发布公告：{stats?.publishedAnnouncementCount ?? 0}</div>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2>分类管理（会影响前台分类展示）</h2>
        <form onSubmit={createCategory} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="新分类名称" />
          <button type="submit">新增分类</button>
        </form>
        <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">ID</th><th align="left">分类名</th><th align="left">操作</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
                <td>{c.id}</td><td>{c.name}</td>
                <td>
                  <button onClick={() => updateCategory(c.id, c.name)}>重命名</button>{' '}
                  <button onClick={() => removeCategory(c.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>产品管理（会影响前台产品展示）</h2>
        <form onSubmit={createProduct} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
          <input required value={newProduct.title} onChange={(e) => setNewProduct((v) => ({ ...v, title: e.target.value }))} placeholder="产品标题" />
          <div style={{ display: 'flex', gap: 8 }}>
            <select required value={newProduct.categoryId} onChange={(e) => setNewProduct((v) => ({ ...v, categoryId: e.target.value }))}>
              <option value="">选择分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required value={newProduct.price} onChange={(e) => setNewProduct((v) => ({ ...v, price: e.target.value }))} placeholder="价格（如 US$0.2-0.4）" />
            <input value={newProduct.moq} onChange={(e) => setNewProduct((v) => ({ ...v, moq: e.target.value }))} placeholder="起订量" />
          </div>
          <input required value={newProduct.img} onChange={(e) => setNewProduct((v) => ({ ...v, img: e.target.value }))} placeholder="图片 URL" />
          <button type="submit">新增产品</button>
        </form>
        <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr><th align="left">ID</th><th align="left">标题</th><th align="left">分类</th><th align="left">价格</th><th align="left">状态</th><th align="left">操作</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                <td>{p.id}</td><td>{p.title}</td><td>{p.category}</td><td>{p.price}</td><td>{p.status}</td>
                <td>
                  <button onClick={() => moveProductCategory(p)}>改分类</button>{' '}
                  <button onClick={() => toggleProductStatus(p)}>{p.status === 'active' ? '下架' : '上架'}</button>{' '}
                  <button onClick={() => removeProduct(p.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
