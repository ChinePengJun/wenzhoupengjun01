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
  const [productView, setProductView] = useState<'list' | 'create' | 'edit'>('list');
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
  }) => {
    const [step, setStep] = useState<'basic' | 'inventory' | 'detail'>('basic');

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="border-b border-slate-200 flex gap-6 text-sm">
          {[
            { key: 'basic', label: '基础信息' },
            { key: 'inventory', label: '规格库存' },
            { key: 'detail', label: '商品详情' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStep(tab.key as 'basic' | 'inventory' | 'detail')}
              className={`pb-3 ${step === tab.key ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {step === 'basic' && (
          <div className="grid md:grid-cols-2 gap-3">
            <input className={inputCls} required value={value.title} onChange={(e) => onChange((v) => ({ ...v, title: e.target.value }))} placeholder="商品名称" />
            <select className={inputCls} required value={value.categoryId} onChange={(e) => onChange((v) => ({ ...v, categoryId: e.target.value }))}>
              <option value="">商品分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className={inputCls} required value={value.moq} onChange={(e) => onChange((v) => ({ ...v, moq: e.target.value }))} placeholder="单位 / 起订量" />
            <input className={inputCls} value={value.videoUrl} onChange={(e) => onChange((v) => ({ ...v, videoUrl: e.target.value }))} placeholder="视频 URL" />
            <input className={`${inputCls} md:col-span-2`} required value={value.img} onChange={(e) => onChange((v) => ({ ...v, img: e.target.value }))} placeholder="商品主图 URL" />
            <div className="text-xs text-slate-500">上传主图<input type="file" accept="image/*" className="block mt-1" onChange={(e) => e.target.files?.[0] && uploadAndSetMainImage(e.target.files[0], target)} /></div>
            <div className="text-xs text-slate-500">上传视频<input type="file" accept="video/*" className="block mt-1" onChange={(e) => e.target.files?.[0] && uploadAndSetVideo(e.target.files[0], target)} /></div>
            <textarea className={`${inputCls} md:col-span-2`} rows={3} value={value.description} onChange={(e) => onChange((v) => ({ ...v, description: e.target.value }))} placeholder="商品描述" />
          </div>
        )}

        {step === 'inventory' && (
          <div className="grid md:grid-cols-3 gap-3">
            <input className={inputCls} required value={value.price} onChange={(e) => onChange((v) => ({ ...v, price: e.target.value }))} placeholder="售价" />
            <input className={inputCls} value={value.thumbnails} onChange={(e) => onChange((v) => ({ ...v, thumbnails: e.target.value }))} placeholder="缩略图 URL（逗号分隔）" />
            <div className="text-xs text-slate-500">上传缩略图<input type="file" accept="image/*" multiple className="block mt-1" onChange={(e) => e.target.files && uploadAndAppendImages(e.target.files, target, 'thumbnails')} /></div>
            <textarea className={`${inputCls} md:col-span-3`} rows={6} value={value.tiers} onChange={(e) => onChange((v) => ({ ...v, tiers: e.target.value }))} placeholder='价格库存 JSON，例如 [{"range":"1-10","price":"10"}]' />
          </div>
        )}

        {step === 'detail' && (
          <div className="grid gap-3">
            <textarea className={inputCls} rows={8} value={value.specs} onChange={(e) => onChange((v) => ({ ...v, specs: e.target.value }))} placeholder='商品参数 JSON，例如 {"材质":"PET"}' />
            <textarea className={inputCls} rows={8} value={value.detailContent} onChange={(e) => onChange((v) => ({ ...v, detailContent: e.target.value }))} placeholder='图文详情 JSON，例如 [{"image":"/uploads/a.jpg","title":"工艺","text":"说明"}]' />
            <div className="text-xs text-slate-500">上传图文详情图片<input type="file" accept="image/*" multiple className="block mt-1" onChange={(e) => e.target.files && uploadAndAppendImages(e.target.files, target, 'detailContent')} /></div>
          </div>
        )}

        <div className="flex gap-2">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm" type="submit">{submitText}</button>
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm" onClick={() => setStep('basic')}>返回基础</button>
        </div>
      </form>
    );
  };

  useEffect(() => {
    if (editingProductId) setProductView('edit');
  }, [editingProductId]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-16 bg-slate-900 text-white flex flex-col items-center py-3 gap-2">
          {['主页','用户','订单','商品','营销','分销','客服','财务','内容','装修','应用','设置','维护'].map((name, idx) => (
            <button key={name} className={`w-full py-2 text-xs ${idx===3 ? 'bg-blue-600' : 'text-slate-200 hover:bg-slate-700'}`}>{name}</button>
          ))}
        </aside>

        <aside className="w-44 bg-white border-r border-slate-200">
          <div className="h-12 px-4 flex items-center font-semibold border-b border-slate-200">商品统计</div>
          <div className="py-2 text-sm">
            {[
              { key: 'products', label: '商品管理' },
              { key: 'categories', label: '商品分类' },
              { key: 'settings', label: '站点设置' },
              { key: 'languages', label: '多语种' },
            ].map((item) => (
              <button key={item.key} onClick={() => setActiveTab(item.key as AdminTab)} className={`w-full text-left px-6 py-3 ${activeTab===item.key ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600' : 'hover:bg-slate-50'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-sm">
            <div className="text-slate-500">商品 / {activeTab === 'products' ? '商品管理' : activeTab === 'categories' ? '商品分类' : activeTab === 'languages' ? '多语种' : '站点设置'}</div>
            <div className="flex gap-2">
              <button className="rounded border px-2 py-1" onClick={() => reload(token)}>刷新</button>
              <button className="rounded border px-2 py-1 text-rose-600" onClick={onLogout}>退出</button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">错误：{error}</p>}

            {activeTab === 'products' && (
              <section className="bg-white border border-slate-200 rounded p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm border-b border-slate-200 pb-2">
                  <button onClick={() => setProductView('list')} className={`px-3 py-1 rounded ${productView==='list' ? 'bg-blue-50 text-blue-600' : ''}`}>商品管理</button>
                  <button onClick={() => { setProductView('create'); setEditingProductId(null); }} className={`px-3 py-1 rounded ${productView==='create' ? 'bg-blue-50 text-blue-600' : ''}`}>添加商品</button>
                  {editingProductId && <button className="px-3 py-1 rounded bg-blue-50 text-blue-600">商品ID: {editingProductId}</button>}
                </div>

                {productView === 'list' && (
                  <>
                    <div className="grid md:grid-cols-4 gap-2 text-sm">
                      <input className={inputCls} value={productKeyword} onChange={(e) => setProductKeyword(e.target.value)} placeholder="请输入商品名称关键词/ID" />
                      <select className={inputCls} value={productFilterCategory} onChange={(e) => setProductFilterCategory(e.target.value)}>
                        <option value="all">全部分类</option>
                        {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                      </select>
                      <button className="rounded bg-blue-600 text-white px-3 py-2">查询</button>
                      <button className="rounded border px-3 py-2" onClick={() => { setProductKeyword(''); setProductFilterCategory('all'); }}>重置</button>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <button className="rounded bg-blue-600 text-white px-3 py-2" onClick={() => setProductView('create')}>添加商品</button>
                      <button className="rounded border px-3 py-2">批量修改</button>
                      <button className="rounded border px-3 py-2">数据导出</button>
                    </div>

                    <div className="overflow-auto border border-slate-200 rounded">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="px-3 py-2 text-left">商品ID</th>
                            <th className="px-3 py-2 text-left">商品图</th>
                            <th className="px-3 py-2 text-left">商品名称</th>
                            <th className="px-3 py-2 text-left">商品分类</th>
                            <th className="px-3 py-2 text-left">售价</th>
                            <th className="px-3 py-2 text-left">库存</th>
                            <th className="px-3 py-2 text-left">状态</th>
                            <th className="px-3 py-2 text-left">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="border-t border-slate-100">
                              <td className="px-3 py-2">{p.id}</td>
                              <td className="px-3 py-2"><img src={p.img} alt={p.title} className="w-10 h-10 object-cover rounded" /></td>
                              <td className="px-3 py-2 max-w-sm truncate">{p.title}</td>
                              <td className="px-3 py-2">{p.category}</td>
                              <td className="px-3 py-2">{p.price}</td>
                              <td className="px-3 py-2">{(p.tiers && p.tiers.length) ? p.tiers.length : '-'}</td>
                              <td className="px-3 py-2">{p.status === 'active' ? '上架' : '下架'}</td>
                              <td className="px-3 py-2 space-x-2">
                                <button className="text-blue-600" onClick={() => startEditProduct(p)}>编辑</button>
                                <button className="text-indigo-600" onClick={() => toggleProductStatus(p)}>{p.status === 'active' ? '下架' : '上架'}</button>
                                <button className="text-rose-600" onClick={() => removeProduct(p.id)}>删除</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {productView === 'create' && (
                  <div>
                    <div className="text-xl font-semibold mb-3">添加商品</div>
                    <ProductForm value={newProduct} onChange={setNewProduct} onSubmit={createProduct} submitText="保存并继续" target="new" />
                  </div>
                )}

                {productView === 'edit' && editingProductId && (
                  <div>
                    <div className="text-xl font-semibold mb-3">编辑商品</div>
                    <ProductForm value={editingProduct} onChange={setEditingProduct} onSubmit={saveEditProduct} submitText="保存" target="edit" />
                    <button className="mt-3 rounded border px-3 py-2 text-sm" onClick={() => { setEditingProductId(null); setProductView('list'); }}>返回列表</button>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'categories' && (
              <section className="bg-white border border-slate-200 rounded p-4">
                <h2 className="text-lg font-semibold mb-3">商品分类</h2>
                <form onSubmit={createCategory} className="flex gap-2 mb-4">
                  <input className={inputCls} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="新分类名称" required />
                  <button className="rounded bg-blue-600 text-white px-3">新增</button>
                </form>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border border-slate-200 rounded px-3 py-2">
                      <div>{c.name} <span className="text-xs text-slate-400">ID:{c.id}</span></div>
                      <div className="space-x-2">
                        <button className="text-blue-600" onClick={() => updateCategory(c.id, c.name)}>重命名</button>
                        <button className="text-rose-600" onClick={() => removeCategory(c.id)}>删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="bg-white border border-slate-200 rounded p-4">
                <h2 className="text-lg font-semibold mb-3">站点设置</h2>
                <form onSubmit={saveSiteSettings} className="grid md:grid-cols-2 gap-2">
                  <input className={inputCls} value={siteSettings.companyName} onChange={(e) => setSiteSettings((v) => ({ ...v, companyName: e.target.value }))} placeholder="公司名称" />
                  <input className={inputCls} value={siteSettings.phone} onChange={(e) => setSiteSettings((v) => ({ ...v, phone: e.target.value }))} placeholder="联系电话" />
                  <input className={inputCls} value={siteSettings.email} onChange={(e) => setSiteSettings((v) => ({ ...v, email: e.target.value }))} placeholder="邮箱" />
                  <input className={inputCls} value={siteSettings.address} onChange={(e) => setSiteSettings((v) => ({ ...v, address: e.target.value }))} placeholder="地址" />
                  <input className={`${inputCls} md:col-span-2`} value={siteSettings.copyright} onChange={(e) => setSiteSettings((v) => ({ ...v, copyright: e.target.value }))} placeholder="版权" />
                  <button className="rounded bg-blue-600 text-white px-3 py-2 w-fit">保存</button>
                </form>
              </section>
            )}

            {activeTab === 'languages' && (
              <section className="bg-white border border-slate-200 rounded p-4">
                <h2 className="text-lg font-semibold mb-3">多语种管理</h2>
                <form onSubmit={saveLanguageSettings} className="grid md:grid-cols-2 gap-2">
                  <input className={inputCls} value={siteSettings.defaultLanguage} onChange={(e) => setSiteSettings((v) => ({ ...v, defaultLanguage: e.target.value }))} placeholder="默认语言" />
                  <input className={inputCls} value={siteSettings.supportedLanguages} onChange={(e) => setSiteSettings((v) => ({ ...v, supportedLanguages: e.target.value }))} placeholder="支持语言 zh,en" />
                  <textarea className={`${inputCls} md:col-span-2`} rows={14} value={siteSettings.i18nMessages} onChange={(e) => setSiteSettings((v) => ({ ...v, i18nMessages: e.target.value }))} placeholder="多语文案 JSON" />
                  <button className="rounded bg-blue-600 text-white px-3 py-2 w-fit">保存多语种</button>
                </form>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
