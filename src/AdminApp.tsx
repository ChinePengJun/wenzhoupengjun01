import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Grid3X3, FolderTree, PlusCircle, Settings, LogOut, Search, RefreshCw } from 'lucide-react';

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
  videoUrl?: string;
  detailContent?: Array<{ image?: string; title?: string; text?: string }>;
};

type Stats = {
  managedUserCount: number;
  activeUserCount: number;
  publishedAnnouncementCount: number;
  categoryCount?: number;
  productCount?: number;
};

type AdminTab = 'overview' | 'products' | 'categories' | 'settings';

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

function parseDetailContent(value: string): Array<{ image?: string; title?: string; text?: string }> {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export default function AdminApp() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({
    title: '',
    categoryId: '',
    price: '',
    img: '',
    moq: '1000 片',
    thumbnails: '',
    videoUrl: '',
    detailContent: '[]',
  });
  const [error, setError] = useState('');
  const [productKeyword, setProductKeyword] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState('all');
  const [siteSettings, setSiteSettings] = useState({
    companyName: '云浠（温州）包装有限公司',
    address: '浙江省温州龙港市启源路2356-2400',
    phone: '+86-131 6635 1888',
    email: 'wzyunxipack@qq.com',
    copyright: '© 云浠（温州）包装有限公司 版权所有',
  });

  const activeProducts = useMemo(() => products.filter((p) => p.status === 'active').length, [products]);
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const hitKeyword = `${p.title} ${p.category}`.toLowerCase().includes(productKeyword.toLowerCase());
      const hitCategory = productFilterCategory === 'all' || String(p.categoryId) === productFilterCategory;
      return hitKeyword && hitCategory;
    });
  }, [products, productKeyword, productFilterCategory]);

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
          videoUrl: newProduct.videoUrl,
          detailContent: parseDetailContent(newProduct.detailContent),
          status: 'active',
        }),
      }, token);
      setNewProduct({ title: '', categoryId: '', price: '', img: '', moq: '1000 片', thumbnails: '', videoUrl: '', detailContent: '[]' });
      await reload(token);
      setActiveTab('products');
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

  async function uploadAndFillMainImage(file: File) {
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await request<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, dataUrl }),
      }, token);
      setNewProduct((v) => ({ ...v, img: result.url }));
    } catch (err) {
      setError(`主图上传失败：${(err as Error).message}`);
    }
  }

  async function uploadAndAppendThumbnails(files: FileList) {
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await fileToDataUrl(file);
        const result = await request<{ url: string }>('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({ filename: file.name, dataUrl }),
        }, token);
        urls.push(result.url);
      }

      setNewProduct((v) => {
        const existing = v.thumbnails.split(',').map((x) => x.trim()).filter(Boolean);
        return { ...v, thumbnails: [...existing, ...urls].join(',') };
      });
    } catch (err) {
      setError(`缩略图上传失败：${(err as Error).message}`);
    }
  }

  async function uploadAndFillVideo(file: File) {
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await request<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, dataUrl }),
      }, token);
      setNewProduct((v) => ({ ...v, videoUrl: result.url }));
    } catch (err) {
      setError(`视频上传失败：${(err as Error).message}`);
    }
  }

  async function uploadAndAppendDetailImages(files: FileList) {
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await fileToDataUrl(file);
        const result = await request<{ url: string }>('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({ filename: file.name, dataUrl }),
        }, token);
        urls.push(result.url);
      }

      setNewProduct((v) => {
        const existing = parseDetailContent(v.detailContent);
        const appended = [...existing, ...urls.map((url) => ({ image: url, title: '', text: '' }))];
        return { ...v, detailContent: JSON.stringify(appended, null, 2) };
      });
    } catch (err) {
      setError(`图文详情图片上传失败：${(err as Error).message}`);
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

    const specsText = window.prompt('产品规格 JSON（例如 {"材质":"PET","品牌":"CY"}）', JSON.stringify(item.specs || {}, null, 2));
    if (specsText === null) return;

    const tiersText = window.prompt('价格阶梯 JSON（例如 [{"range":"1000-3000","price":"US$0.2"}]）', JSON.stringify(item.tiers || [], null, 2));
    if (tiersText === null) return;

    const thumbnailsText = window.prompt('详情缩略图 JSON（例如 ["https://a.jpg","https://b.jpg"]）', JSON.stringify(item.thumbnails || [], null, 2));
    if (thumbnailsText === null) return;

    const videoUrl = window.prompt('详情视频 URL（可留空）', item.videoUrl || '');
    if (videoUrl === null) return;

    const detailContentText = window.prompt('图文详情 JSON（例如 [{"image":"/uploads/1.jpg","title":"生产细节","text":"支持定制"}]）', JSON.stringify(item.detailContent || [], null, 2));
    if (detailContentText === null) return;

    try {
      await request(`/api/admin/products/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          description,
          specs: JSON.parse(specsText),
          tiers: JSON.parse(tiersText),
          thumbnails: JSON.parse(thumbnailsText),
          videoUrl,
          detailContent: JSON.parse(detailContentText),
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
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm h-fit lg:sticky lg:top-4">
            <div className="mb-4">
              <h1 className="text-lg font-black text-slate-900">管理控制台</h1>
              <p className="text-xs text-slate-500">更直观的分类与产品管理</p>
            </div>

            <div className="space-y-1">
              {[
                { key: 'overview', label: '总览', icon: Grid3X3 },
                { key: 'products', label: '产品管理', icon: PlusCircle },
                { key: 'categories', label: '分类管理', icon: FolderTree },
                { key: 'settings', label: '站点设置', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as AdminTab)}
                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <button className="w-full rounded-xl px-3 py-2 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2" onClick={() => reload(token)}>
                <RefreshCw size={14} /> 刷新数据
              </button>
              <button className="w-full rounded-xl px-3 py-2 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-2" onClick={onLogout}>
                <LogOut size={14} /> 退出登录
              </button>
            </div>
          </aside>

          <main className="space-y-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">错误：{error}</p>}

            <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className={cardCls}><p className="text-xs text-slate-500">分类总数</p><p className="text-2xl font-black">{stats?.categoryCount ?? categories.length}</p></div>
              <div className={cardCls}><p className="text-xs text-slate-500">产品总数</p><p className="text-2xl font-black">{stats?.productCount ?? products.length}</p></div>
              <div className={cardCls}><p className="text-xs text-slate-500">上架产品</p><p className="text-2xl font-black">{activeProducts}</p></div>
              <div className={cardCls}><p className="text-xs text-slate-500">管理用户</p><p className="text-2xl font-black">{stats?.managedUserCount ?? 0}</p></div>
              <div className={cardCls}><p className="text-xs text-slate-500">已发布公告</p><p className="text-2xl font-black">{stats?.publishedAnnouncementCount ?? 0}</p></div>
            </section>

            {activeTab === 'overview' && (
              <section className={cardCls}>
                <h2 className="text-lg font-bold mb-3">快速入口</h2>
                <div className="grid md:grid-cols-3 gap-3">
                  <button className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => setActiveTab('products')}>
                    <div className="font-semibold">产品管理</div>
                    <div className="text-xs text-slate-500 mt-1">新增产品、筛选产品、上架下架</div>
                  </button>
                  <button className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => setActiveTab('categories')}>
                    <div className="font-semibold">分类管理</div>
                    <div className="text-xs text-slate-500 mt-1">新建分类、重命名、删除分类</div>
                  </button>
                  <button className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => setActiveTab('settings')}>
                    <div className="font-semibold">站点设置</div>
                    <div className="text-xs text-slate-500 mt-1">公司信息、联系方式、版权</div>
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className={cardCls}>
                <h2 className="text-lg font-bold mb-3">站点信息设置（影响前台）</h2>
                <form onSubmit={saveSiteSettings} className="grid md:grid-cols-2 gap-2 mb-2">
                  <input className={inputCls} value={siteSettings.companyName} onChange={(e) => setSiteSettings((v) => ({ ...v, companyName: e.target.value }))} placeholder="公司名称" />
                  <input className={inputCls} value={siteSettings.phone} onChange={(e) => setSiteSettings((v) => ({ ...v, phone: e.target.value }))} placeholder="联系电话" />
                  <input className={inputCls} value={siteSettings.email} onChange={(e) => setSiteSettings((v) => ({ ...v, email: e.target.value }))} placeholder="联系邮箱" />
                  <input className={inputCls} value={siteSettings.address} onChange={(e) => setSiteSettings((v) => ({ ...v, address: e.target.value }))} placeholder="公司地址" />
                  <input className={`${inputCls} md:col-span-2`} value={siteSettings.copyright} onChange={(e) => setSiteSettings((v) => ({ ...v, copyright: e.target.value }))} placeholder="版权文案" />
                  <button className={`${btnCls} w-fit`} type="submit">保存站点信息</button>
                </form>
              </section>
            )}

            {activeTab === 'categories' && (
              <section className={cardCls}>
                <h2 className="text-lg font-bold mb-3">分类管理</h2>
                <form onSubmit={createCategory} className="flex flex-col md:flex-row gap-2 mb-4">
                  <input className={inputCls} required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="新分类名称" />
                  <button className={btnCls} type="submit">新增分类</button>
                </form>

                <div className="grid md:grid-cols-2 gap-3">
                  {categories.map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-slate-500">分类 ID: {c.id}</div>
                      </div>
                      <div className="space-x-2">
                        <button className="rounded-lg bg-slate-100 px-2 py-1 text-sm" onClick={() => updateCategory(c.id, c.name)}>重命名</button>
                        <button className="rounded-lg bg-red-50 text-red-600 px-2 py-1 text-sm" onClick={() => removeCategory(c.id)}>删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'products' && (
              <section className="space-y-4">
                <div className={cardCls}>
                  <h2 className="text-lg font-bold mb-3">新增产品</h2>
                  <form onSubmit={createProduct} className="grid gap-2">
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
                    <label className="text-xs text-slate-500">上传主图
                      <input type="file" accept="image/*" className="block mt-1" onChange={(e) => e.target.files?.[0] && uploadAndFillMainImage(e.target.files[0])} />
                    </label>
                    <input className={inputCls} value={newProduct.thumbnails} onChange={(e) => setNewProduct((v) => ({ ...v, thumbnails: e.target.value }))} placeholder="详情缩略图 URL（多个用逗号分隔）" />
                    <label className="text-xs text-slate-500">上传详情缩略图（可多选）
                      <input type="file" accept="image/*" multiple className="block mt-1" onChange={(e) => e.target.files && uploadAndAppendThumbnails(e.target.files)} />
                    </label>
                    <input className={inputCls} value={newProduct.videoUrl} onChange={(e) => setNewProduct((v) => ({ ...v, videoUrl: e.target.value }))} placeholder="详情视频 URL" />
                    <label className="text-xs text-slate-500">上传详情视频
                      <input type="file" accept="video/*" className="block mt-1" onChange={(e) => e.target.files?.[0] && uploadAndFillVideo(e.target.files[0])} />
                    </label>
                    <textarea className={inputCls} rows={6} value={newProduct.detailContent} onChange={(e) => setNewProduct((v) => ({ ...v, detailContent: e.target.value }))} placeholder='图文详情 JSON，示例：[{"image":"/uploads/a.jpg","title":"工艺说明","text":"可定制LOGO"}]' />
                    <label className="text-xs text-slate-500">上传图文详情图片（可多选）
                      <input type="file" accept="image/*" multiple className="block mt-1" onChange={(e) => e.target.files && uploadAndAppendDetailImages(e.target.files)} />
                    </label>
                    <button className={`${btnCls} w-fit`} type="submit">新增产品</button>
                  </form>
                </div>

                <div className={cardCls}>
                  <h2 className="text-lg font-bold mb-3">产品列表</h2>
                  <div className="grid md:grid-cols-[1fr_220px] gap-2 mb-4">
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className={`${inputCls} pl-9`} value={productKeyword} onChange={(e) => setProductKeyword(e.target.value)} placeholder="搜索产品标题/分类" />
                    </div>
                    <select className={inputCls} value={productFilterCategory} onChange={(e) => setProductFilterCategory(e.target.value)}>
                      <option value="all">全部分类</option>
                      {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {filteredProducts.map((p) => (
                      <div key={p.id} className="rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <img src={p.img} alt={p.title} className="w-full md:w-24 h-24 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{p.title}</div>
                          <div className="text-xs text-slate-500 mt-1">分类：{p.category} · 价格：{p.price} · MOQ：{p.moq}</div>
                          <div className="text-xs text-slate-400 mt-1">缩略图 {p.thumbnails?.length || 0} · 视频 {p.videoUrl ? '1' : '0'} · 图文详情 {p.detailContent?.length || 0}</div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <span className={`rounded-full px-2 py-1 text-xs ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                          <button className="rounded-lg bg-slate-100 px-2 py-1 text-sm" onClick={() => moveProductCategory(p)}>改分类</button>
                          <button className="rounded-lg bg-amber-50 text-amber-700 px-2 py-1 text-sm" onClick={() => editProductDetail(p)}>编辑详情</button>
                          <button className="rounded-lg bg-indigo-50 text-indigo-700 px-2 py-1 text-sm" onClick={() => toggleProductStatus(p)}>{p.status === 'active' ? '下架' : '上架'}</button>
                          <button className="rounded-lg bg-red-50 text-red-600 px-2 py-1 text-sm" onClick={() => removeProduct(p.id)}>删除</button>
                        </div>
                      </div>
                    ))}
                    {!filteredProducts.length && <div className="text-sm text-slate-500">暂无匹配产品。</div>}
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
