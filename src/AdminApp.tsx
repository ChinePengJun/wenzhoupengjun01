import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Grid3X3, FolderTree, PlusCircle, Settings, Languages, LogOut, Search, RefreshCw, Pencil } from 'lucide-react';

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

type AdminTab = 'overview' | 'products' | 'categories' | 'settings' | 'languages';
type ProductFormState = {
  title: string;
  categoryId: string;
  price: string;
  img: string;
  moq: string;
  thumbnails: string;
  videoUrl: string;
  description: string;
  specs: string;
  tiers: string;
  detailContent: string;
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

function parseJsonArray(value: string) {
  if (!value.trim()) return [];
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function toFormState(product?: Product): ProductFormState {
  if (!product) {
    return {
      title: '', categoryId: '', price: '', img: '', moq: '1000 片', thumbnails: '', videoUrl: '', description: '',
      specs: '{}', tiers: '[]', detailContent: '[]',
    };
  }
  return {
    title: product.title || '',
    categoryId: String(product.categoryId || ''),
    price: product.price || '',
    img: product.img || '',
    moq: product.moq || '1000 片',
    thumbnails: (product.thumbnails || []).join(', '),
    videoUrl: product.videoUrl || '',
    description: product.description || '',
    specs: JSON.stringify(product.specs || {}, null, 2),
    tiers: JSON.stringify(product.tiers || [], null, 2),
    detailContent: JSON.stringify(product.detailContent || [], null, 2),
  };
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
  const [newProduct, setNewProduct] = useState<ProductFormState>(toFormState());
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductFormState>(toFormState());
  const [error, setError] = useState('');
  const [productKeyword, setProductKeyword] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState('all');
  const [siteSettings, setSiteSettings] = useState({
    companyName: '云浠（温州）包装有限公司',
    address: '浙江省温州龙港市启源路2356-2400',
    phone: '+86-131 6635 1888',
    email: 'wzyunxipack@qq.com',
    copyright: '© 云浠（温州）包装有限公司 版权所有',
    defaultLanguage: 'zh',
    supportedLanguages: 'zh,en',
    i18nMessages: '{"zh":{"home":"首页"},"en":{"home":"Home"}}',
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
    try { await request('/api/admin/auth/logout', { method: 'POST' }, token); } catch {}
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

  function buildProductPayload(form: ProductFormState) {
    return {
      title: form.title,
      categoryId: Number(form.categoryId),
      price: form.price,
      img: form.img,
      moq: form.moq,
      description: form.description,
      specs: form.specs.trim() ? JSON.parse(form.specs) : {},
      tiers: parseJsonArray(form.tiers),
      thumbnails: form.thumbnails.split(',').map((x) => x.trim()).filter(Boolean),
      videoUrl: form.videoUrl,
      detailContent: parseJsonArray(form.detailContent),
    };
  }

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    try {
      await request('/api/admin/products', { method: 'POST', body: JSON.stringify({ ...buildProductPayload(newProduct), status: 'active' }) }, token);
      setNewProduct(toFormState());
      await reload(token);
      setActiveTab('products');
    } catch (err) {
      setError(`新增产品失败：${(err as Error).message}`);
    }
  }

  function startEditProduct(item: Product) {
    setEditingProductId(item.id);
    setEditingProduct(toFormState(item));
  }

  async function saveEditProduct(e: FormEvent) {
    e.preventDefault();
    if (!editingProductId) return;
    try {
      await request(`/api/admin/products/${editingProductId}`, {
        method: 'PUT',
        body: JSON.stringify(buildProductPayload(editingProduct)),
      }, token);
      setEditingProductId(null);
      setEditingProduct(toFormState());
      await reload(token);
    } catch (err) {
      setError(`更新产品失败：${(err as Error).message}`);
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

  async function uploadSingle(file: File) {
    const dataUrl = await fileToDataUrl(file);
    return request<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, dataUrl }),
    }, token);
  }

  async function uploadAndSetMainImage(file: File, target: 'new' | 'edit') {
    try {
      const result = await uploadSingle(file);
      if (target === 'new') setNewProduct((v) => ({ ...v, img: result.url }));
      else setEditingProduct((v) => ({ ...v, img: result.url }));
    } catch (err) {
      setError(`主图上传失败：${(err as Error).message}`);
    }
  }

  async function uploadAndSetVideo(file: File, target: 'new' | 'edit') {
    try {
      const result = await uploadSingle(file);
      if (target === 'new') setNewProduct((v) => ({ ...v, videoUrl: result.url }));
      else setEditingProduct((v) => ({ ...v, videoUrl: result.url }));
    } catch (err) {
      setError(`视频上传失败：${(err as Error).message}`);
    }
  }

  async function uploadAndAppendImages(files: FileList, target: 'new' | 'edit', field: 'thumbnails' | 'detailContent') {
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadSingle(file);
        urls.push(result.url);
      }

      const setter = target === 'new' ? setNewProduct : setEditingProduct;
      setter((v) => {
        if (field === 'thumbnails') {
          const existing = v.thumbnails.split(',').map((x) => x.trim()).filter(Boolean);
          return { ...v, thumbnails: [...existing, ...urls].join(', ') };
        }
        const existing = parseJsonArray(v.detailContent);
        const appended = [...existing, ...urls.map((url) => ({ image: url, title: '', text: '' }))];
        return { ...v, detailContent: JSON.stringify(appended, null, 2) };
      });
    } catch (err) {
      setError(`图片上传失败：${(err as Error).message}`);
    }
  }

  async function saveSiteSettings(e: FormEvent) {
    e.preventDefault();
    try {
      await request('/api/admin/site-settings', { method: 'PUT', body: JSON.stringify(siteSettings) }, token);
      await reload(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveLanguageSettings(e: FormEvent) {
    e.preventDefault();
    try {
      JSON.parse(siteSettings.i18nMessages || '{}');
      await request('/api/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify({
          defaultLanguage: siteSettings.defaultLanguage,
          supportedLanguages: siteSettings.supportedLanguages,
          i18nMessages: siteSettings.i18nMessages,
        }),
      }, token);
      await reload(token);
    } catch (err) {
      setError(`多语种保存失败：${(err as Error).message}`);
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

  const ProductForm = ({
    value, onChange, onSubmit, submitText, target,
  }: {
    value: ProductFormState;
    onChange: Dispatch<SetStateAction<ProductFormState>>;
    onSubmit: (e: FormEvent) => Promise<void> | void;
    submitText: string;
    target: 'new' | 'edit';
  }) => (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid md:grid-cols-2 gap-2">
        <input className={inputCls} required value={value.title} onChange={(e) => onChange((v) => ({ ...v, title: e.target.value }))} placeholder="产品标题" />
        <select className={inputCls} required value={value.categoryId} onChange={(e) => onChange((v) => ({ ...v, categoryId: e.target.value }))}>
          <option value="">选择分类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        <input className={inputCls} required value={value.price} onChange={(e) => onChange((v) => ({ ...v, price: e.target.value }))} placeholder="价格（US$0.2-0.4）" />
        <input className={inputCls} value={value.moq} onChange={(e) => onChange((v) => ({ ...v, moq: e.target.value }))} placeholder="起订量" />
        <input className={inputCls} value={value.videoUrl} onChange={(e) => onChange((v) => ({ ...v, videoUrl: e.target.value }))} placeholder="详情视频 URL" />
      </div>
      <input className={inputCls} required value={value.img} onChange={(e) => onChange((v) => ({ ...v, img: e.target.value }))} placeholder="主图 URL" />
      <div className="grid md:grid-cols-2 gap-2 text-xs text-slate-500">
        <label>上传主图<input type="file" accept="image/*" className="block mt-1" onChange={(e) => e.target.files?.[0] && uploadAndSetMainImage(e.target.files[0], target)} /></label>
        <label>上传视频<input type="file" accept="video/*" className="block mt-1" onChange={(e) => e.target.files?.[0] && uploadAndSetVideo(e.target.files[0], target)} /></label>
      </div>
      <input className={inputCls} value={value.thumbnails} onChange={(e) => onChange((v) => ({ ...v, thumbnails: e.target.value }))} placeholder="详情缩略图 URL（多个用逗号分隔）" />
      <div className="text-xs text-slate-500">
        上传详情缩略图（可多选）
        <input type="file" accept="image/*" multiple className="block mt-1" onChange={(e) => e.target.files && uploadAndAppendImages(e.target.files, target, 'thumbnails')} />
      </div>
      <textarea className={inputCls} rows={2} value={value.description} onChange={(e) => onChange((v) => ({ ...v, description: e.target.value }))} placeholder="产品描述" />
      <textarea className={inputCls} rows={4} value={value.specs} onChange={(e) => onChange((v) => ({ ...v, specs: e.target.value }))} placeholder='规格 JSON，例如 {"材质":"PET"}' />
      <textarea className={inputCls} rows={4} value={value.tiers} onChange={(e) => onChange((v) => ({ ...v, tiers: e.target.value }))} placeholder='价格阶梯 JSON，例如 [{"range":"1000-3000","price":"US$0.2"}]' />
      <textarea className={inputCls} rows={6} value={value.detailContent} onChange={(e) => onChange((v) => ({ ...v, detailContent: e.target.value }))} placeholder='图文详情 JSON，示例：[{"image":"/uploads/a.jpg","title":"工艺说明","text":"可定制LOGO"}]' />
      <div className="text-xs text-slate-500">
        上传图文详情图片（可多选）
        <input type="file" accept="image/*" multiple className="block mt-1" onChange={(e) => e.target.files && uploadAndAppendImages(e.target.files, target, 'detailContent')} />
      </div>
      <button className={`${btnCls} w-fit`} type="submit">{submitText}</button>
    </form>
  );

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
                { key: 'languages', label: '多语种', icon: Languages },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveTab(item.key as AdminTab)} className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <Icon size={16} /><span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <button className="w-full rounded-xl px-3 py-2 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2" onClick={() => reload(token)}><RefreshCw size={14} /> 刷新数据</button>
              <button className="w-full rounded-xl px-3 py-2 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-2" onClick={onLogout}><LogOut size={14} /> 退出登录</button>
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

            {activeTab === 'overview' && <section className={cardCls}><h2 className="text-lg font-bold mb-3">快速入口</h2><div className="text-sm text-slate-500">可从左侧进入产品、分类、站点设置、多语种模块。</div></section>}

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


            {activeTab === 'languages' && (
              <section className={cardCls}>
                <h2 className="text-lg font-bold mb-3">多语种管理</h2>
                <form onSubmit={saveLanguageSettings} className="grid md:grid-cols-2 gap-2">
                  <input className={inputCls} value={siteSettings.defaultLanguage} onChange={(e) => setSiteSettings((v) => ({ ...v, defaultLanguage: e.target.value }))} placeholder="默认语言（如 zh）" />
                  <input className={inputCls} value={siteSettings.supportedLanguages} onChange={(e) => setSiteSettings((v) => ({ ...v, supportedLanguages: e.target.value }))} placeholder="支持语言（逗号分隔，如 zh,en,ja）" />
                  <textarea className={`${inputCls} md:col-span-2`} rows={12} value={siteSettings.i18nMessages} onChange={(e) => setSiteSettings((v) => ({ ...v, i18nMessages: e.target.value }))} placeholder='多语种文案 JSON，例如 {"zh":{"home":"首页"},"en":{"home":"Home"}}' />
                  <div className="md:col-span-2 text-xs text-slate-500">建议至少提供键：home/about/products/contact/contactInfo/address/phone/email/faq/keyAttributes/richDetails。</div>
                  <button className={`${btnCls} w-fit`} type="submit">保存多语种配置</button>
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
                      <div><div className="font-semibold">{c.name}</div><div className="text-xs text-slate-500">分类 ID: {c.id}</div></div>
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
                  <h2 className="text-lg font-bold mb-3">新增产品（完整信息）</h2>
                  <ProductForm value={newProduct} onChange={setNewProduct} onSubmit={createProduct} submitText="新增产品" target="new" />
                </div>

                {editingProductId && (
                  <div className={cardCls}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold">编辑产品 #{editingProductId}</h2>
                      <button className="rounded-lg bg-slate-100 px-2 py-1 text-sm" onClick={() => setEditingProductId(null)}>取消编辑</button>
                    </div>
                    <ProductForm value={editingProduct} onChange={setEditingProduct} onSubmit={saveEditProduct} submitText="保存修改" target="edit" />
                  </div>
                )}

                <div className={cardCls}>
                  <h2 className="text-lg font-bold mb-3">产品列表（卡片视图）</h2>
                  <div className="grid md:grid-cols-[1fr_220px] gap-2 mb-4">
                    <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${inputCls} pl-9`} value={productKeyword} onChange={(e) => setProductKeyword(e.target.value)} placeholder="搜索产品标题/分类" /></div>
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
                          <button className="rounded-lg bg-slate-100 px-2 py-1 text-sm flex items-center gap-1" onClick={() => startEditProduct(p)}><Pencil size={14} />编辑</button>
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
