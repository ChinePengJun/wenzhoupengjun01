import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  LogOut,
  MessageSquare,
  Newspaper,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Menu,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../context/SettingsContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function Admin() {
  const { refreshSettings } = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    companyName: "云浠包装",
    companyNameEn: "CY STICKER",
    phone: "+86 123 4567 8900",
    email: "sales@cysticker.com",
    address: "广东省温州市龙港市某某工业园",
    seoTitle: "云浠包装 | 专业3D滴胶贴纸与不干胶标签定制厂家",
    seoKeywords: "3D滴胶贴纸, 不干胶标签, 定制包装, 云浠包装",
    seoDescription: "温州云浠包装有限公司专注于高品质3D滴胶贴纸、不干胶标签及各类定制包装盒的研发与生产，为您提供一站式包装解决方案。",
    aboutTitle: "云浠包装 - 您的专业包装合作伙伴",
    aboutTitleEn: "Yunxi Packaging - Your Professional Packaging Partner",
    aboutContent: "温州云浠包装有限公司坐落于中国印刷城——龙港，是一家集研发、生产、销售于一体的专业包装企业。我们专注于3D滴胶贴纸、不干胶标签、定制包装盒等产品的生产，拥有先进的生产设备和专业的技术团队。",
    aboutContentEn: "Wenzhou Yunxi Packaging Co., Ltd. is located in Longgang, the Printing City of China. We are a professional packaging enterprise integrating R&D, production, and sales. We focus on the production of 3D epoxy stickers, self-adhesive labels, custom packaging boxes, etc."
  });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    fetchData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { // Simple hardcoded password for demo
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
    } else {
      alert("密码错误");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, newsRes, inqRes, settingsRes, bannerRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/news"),
        fetch("/api/inquiries"),
        fetch("/api/settings"),
        fetch("/api/banners")
      ]);
      setProducts(await prodRes.json());
      setNews(await newsRes.json());
      setInquiries(await inqRes.json());
      setBanners(await bannerRes.json());
      
      const settingsData = await settingsRes.json();
      if (Object.keys(settingsData).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save each setting key-value pair
      const promises = Object.entries(settings).map(([key, value]) => 
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value })
        })
      );
      await Promise.all(promises);
      await refreshSettings();
      alert("设置已保存");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存失败");
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video' = 'image') => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("上传失败");
      return null;
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProduct)
    });
    if (res.ok) {
      setEditingProduct(null);
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("确定要删除这个产品吗？")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingNews)
    });
    if (res.ok) {
      setEditingNews(null);
      fetchData();
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("确定要删除这条新闻吗？")) return;
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm("确定要删除这条询盘吗？")) return;
    const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleUpdateInquiryStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/inquiries/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i));
    } catch (error) {
      console.error("Failed to update inquiry status:", error);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingBanner)
    });
    if (res.ok) {
      setEditingBanner(null);
      fetchData();
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("确定要删除这个横幅吗？")) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center mb-2">管理后台登录</h1>
          <p className="text-gray-500 text-center mb-8 text-sm">请输入管理员密码以继续</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">管理员密码</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-black hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              登录系统
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold italic">CY</div>
          <span className="font-black tracking-tight text-lg">管理后台</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-white/10 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:z-auto
        w-64 bg-gray-900 text-white flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold italic">CY</div>
          <span className="font-black tracking-tight text-xl">管理后台</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "dashboard" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-bold">仪表盘</span>
          </button>
          <button 
            onClick={() => { setActiveTab("banners"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "banners" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
          >
            <Monitor size={20} />
            <span className="font-bold">横幅管理</span>
          </button>
          <button 
            onClick={() => { setActiveTab("products"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "products" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
          >
            <Package size={20} />
            <span className="font-bold">产品管理</span>
          </button>
          <button 
            onClick={() => { setActiveTab("news"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "news" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
          >
            <Newspaper size={20} />
            <span className="font-bold">新闻管理</span>
          </button>
          <button 
            onClick={() => { setActiveTab("inquiries"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "inquiries" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
          >
            <MessageSquare size={20} />
            <span className="font-bold">询盘管理</span>
          </button>
          <button 
            onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
          >
            <Settings size={20} />
            <span className="font-bold">站点设置</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
            <ExternalLink size={18} />
            <span className="text-sm">查看官网</span>
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {activeTab === "dashboard" && "仪表盘概览"}
              {activeTab === "banners" && "横幅管理"}
              {activeTab === "products" && "产品管理"}
              {activeTab === "news" && "新闻管理"}
              {activeTab === "inquiries" && "询盘管理"}
              {activeTab === "settings" && "站点设置"}
            </h1>
            <p className="text-gray-500 text-sm">
              {activeTab === "dashboard" && "欢迎回来，这是您的业务概览"}
              {activeTab === "products" && "管理您的产品目录与展示"}
              {activeTab === "news" && "发布与管理公司动态与行业资讯"}
              {activeTab === "inquiries" && "查看并处理客户的在线咨询"}
              {activeTab === "settings" && "配置您的官网基本信息与SEO"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === "banners" && (
              <button 
                onClick={() => setEditingBanner({ title: "", title_en: "", subtitle: "", subtitle_en: "", img: "", link: "", order_index: 0 })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-100"
              >
                <Plus size={18} />
                添加横幅
              </button>
            )}
            {activeTab === "products" && (
              <button 
                onClick={() => setEditingProduct({ title: "", category: "3D滴胶贴纸", price: "", img: "", moq: "", description: "", isFeatured: 0 })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-100"
              >
                <Plus size={18} />
                新增产品
              </button>
            )}
            {activeTab === "news" && (
              <button 
                onClick={() => setEditingNews({ title: "", title_en: "", excerpt: "", excerpt_en: "", category: "公司动态", author: "云浠新闻中心", date: new Date().toISOString().split('T')[0], img: "" })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-100"
              >
                <Plus size={18} />
                发布新闻
              </button>
            )}
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-bold">产品总数</div>
                  <div className="text-2xl font-black">{products.length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-bold">待处理询盘</div>
                  <div className="text-2xl font-black">{inquiries.filter(i => i.status === 'pending').length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Newspaper size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-bold">新闻动态</div>
                  <div className="text-2xl font-black">{news.length}</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-6">询盘趋势</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Mon', value: 4 },
                      { name: 'Tue', value: 7 },
                      { name: 'Wed', value: 5 },
                      { name: 'Thu', value: 12 },
                      { name: 'Fri', value: 9 },
                      { name: 'Sat', value: 15 },
                      { name: 'Sun', value: 10 },
                    ]}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-6">产品分类分布</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '滴胶贴纸', value: products.filter(p => p.category.includes('滴胶')).length },
                      { name: '不干胶', value: products.filter(p => p.category.includes('不干胶')).length },
                      { name: '包装盒', value: products.filter(p => p.category.includes('包装')).length },
                      { name: '其他', value: products.filter(p => !p.category.includes('滴胶') && !p.category.includes('不干胶') && !p.category.includes('包装')).length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                      <Tooltip 
                        cursor={{fill: '#f9fafb'}}
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-black text-gray-900">最近询盘</h3>
                <button onClick={() => setActiveTab("inquiries")} className="text-xs font-bold text-red-600 hover:underline">查看全部</button>
              </div>
              <div className="divide-y divide-gray-50">
                {inquiries.slice(0, 5).map((inq) => (
                  <div key={inq.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        {inq.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{inq.name}</div>
                        <div className="text-xs text-gray-400">{inq.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-400">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inq.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                        inq.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inq.status === 'resolved' ? '已解决' : inq.status === 'processing' ? '处理中' : '待处理'}
                      </span>
                    </div>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-400">暂无询盘数据</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "banners" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">预览</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">标题</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">排序</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {banners.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">暂无横幅</td></tr>
                  ) : (
                    banners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-24 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img src={banner.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{banner.title}</div>
                          <div className="text-xs text-gray-400">{banner.subtitle}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{banner.order_index}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingBanner(banner)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <Pencil size={18} />
                            </button>
                            <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">产品信息</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">价格</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">暂无产品</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img src={product.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="max-w-xs">
                            <div className="font-bold text-gray-900 truncate">{product.title}</div>
                            <div className="text-xs text-gray-400">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">{product.price}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingProduct(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {activeTab === "news" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">新闻标题</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">日期</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img src={item.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="max-w-xs">
                          <div className="font-bold text-gray-900 truncate">{item.title}</div>
                          <div className="text-xs text-gray-400 truncate">{item.title_en}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-[10px] font-black uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingNews(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">客户信息</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">咨询内容</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{inq.name}</div>
                      <div className="text-xs text-gray-400">{inq.email}</div>
                      <div className="text-xs text-gray-400">{inq.phone}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(inq.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-md">{inq.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={inq.status || 'pending'} 
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border-none outline-none cursor-pointer ${
                          inq.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                          inq.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <option value="pending">待处理</option>
                        <option value="processing">处理中</option>
                        <option value="resolved">已解决</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteInquiry(inq.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-4xl space-y-8">
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-red-600" />
                  基本信息设置
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">公司名称 (CN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.companyName}
                      onChange={e => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">公司名称 (EN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.companyNameEn}
                      onChange={e => setSettings({...settings, companyNameEn: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">联系电话</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.phone}
                      onChange={e => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">联系邮箱</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.email}
                      onChange={e => setSettings({...settings, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">公司地址</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.address}
                      onChange={e => setSettings({...settings, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-red-600" />
                  SEO 优化设置
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">首页标题 (Title)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.seoTitle}
                      onChange={e => setSettings({...settings, seoTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">首页关键词 (Keywords)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.seoKeywords}
                      onChange={e => setSettings({...settings, seoKeywords: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">首页描述 (Description)</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all resize-none"
                      value={settings.seoDescription}
                      onChange={e => setSettings({...settings, seoDescription: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                  <Newspaper size={20} className="text-red-600" />
                  关于我们内容设置
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">关于我们标题 (CN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.aboutTitle || ""}
                      onChange={e => setSettings({...settings, aboutTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">关于我们标题 (EN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all" 
                      value={settings.aboutTitleEn || ""}
                      onChange={e => setSettings({...settings, aboutTitleEn: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">关于我们内容 (CN)</label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all resize-none"
                      value={settings.aboutContent || ""}
                      onChange={e => setSettings({...settings, aboutContent: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">关于我们内容 (EN)</label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all resize-none"
                      value={settings.aboutContentEn || ""}
                      onChange={e => setSettings({...settings, aboutContentEn: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="bg-gray-900 text-white px-12 py-4 rounded-full font-black hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
                >
                  <Save size={20} />
                  保存所有设置
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">
                {editingProduct.id ? "编辑产品" : "新增产品"}
              </h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">产品名称</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingProduct.title}
                    onChange={e => setEditingProduct({...editingProduct, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">产品分类</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    <option>3D滴胶贴纸</option>
                    <option>不干胶标签</option>
                    <option>定制包装盒</option>
                    <option>纸袋/手提袋</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">价格范围</label>
                  <input 
                    required
                    type="text" 
                    placeholder="如: US$0.20-0.23"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">起订量</label>
                  <input 
                    type="text" 
                    placeholder="如: 3000 pieces"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingProduct.moq}
                    onChange={e => setEditingProduct({...editingProduct, moq: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">主图链接 / 上传</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                      value={editingProduct.img}
                      onChange={e => setEditingProduct({...editingProduct, img: e.target.value})}
                    />
                    <label className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-xl cursor-pointer transition-all">
                      <ImageIcon size={20} className="text-gray-600" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setEditingProduct({...editingProduct, img: url});
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">视频链接 / 上传 (可选)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                      value={editingProduct.video_url || ""}
                      onChange={e => setEditingProduct({...editingProduct, video_url: e.target.value})}
                      placeholder="视频 URL 或上传"
                    />
                    <label className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-xl cursor-pointer transition-all">
                      <Monitor size={20} className="text-gray-600" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file, 'video');
                            if (url) setEditingProduct({...editingProduct, video_url: url});
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">产品描述</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all resize-none"
                    value={editingProduct.description || ""}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                      checked={!!editingProduct.isFeatured}
                      onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked ? 1 : 0})}
                    />
                    <span className="text-sm font-bold text-gray-700">设为明星产品 (首页展示)</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
              <button 
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveProduct}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-red-100"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Edit Modal */}
      {editingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingNews(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">
                {editingNews.id ? "编辑新闻" : "发布新闻"}
              </h2>
              <button onClick={() => setEditingNews(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveNews} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">新闻标题 (CN)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingNews.title}
                    onChange={e => setEditingNews({...editingNews, title: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">新闻标题 (EN)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingNews.title_en}
                    onChange={e => setEditingNews({...editingNews, title_en: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">分类</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingNews.category}
                    onChange={e => setEditingNews({...editingNews, category: e.target.value})}
                  >
                    <option>公司动态</option>
                    <option>行业资讯</option>
                    <option>技术分享</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">日期</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingNews.date}
                    onChange={e => setEditingNews({...editingNews, date: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">封面图链接 / 上传</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                      value={editingNews.img}
                      onChange={e => setEditingNews({...editingNews, img: e.target.value})}
                    />
                    <label className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-xl cursor-pointer transition-all">
                      <ImageIcon size={20} className="text-gray-600" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setEditingNews({...editingNews, img: url});
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">摘要 (CN)</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all resize-none"
                    value={editingNews.excerpt}
                    onChange={e => setEditingNews({...editingNews, excerpt: e.target.value})}
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">摘要 (EN)</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all resize-none"
                    value={editingNews.excerpt_en}
                    onChange={e => setEditingNews({...editingNews, excerpt_en: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </form>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
              <button 
                type="button"
                onClick={() => setEditingNews(null)}
                className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveNews}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-red-100"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingBanner(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">
                {editingBanner.id ? "编辑横幅" : "新增横幅"}
              </h2>
              <button onClick={() => setEditingBanner(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveBanner} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">标题 (CN)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingBanner.title}
                    onChange={e => setEditingBanner({...editingBanner, title: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">标题 (EN)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingBanner.title_en || ""}
                    onChange={e => setEditingBanner({...editingBanner, title_en: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">副标题 (CN)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingBanner.subtitle || ""}
                    onChange={e => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">副标题 (EN)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingBanner.subtitle_en || ""}
                    onChange={e => setEditingBanner({...editingBanner, subtitle_en: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">图片链接 / 上传</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                      value={editingBanner.img}
                      onChange={e => setEditingBanner({...editingBanner, img: e.target.value})}
                    />
                    <label className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-xl cursor-pointer transition-all">
                      <ImageIcon size={20} className="text-gray-600" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setEditingBanner({...editingBanner, img: url});
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">跳转链接</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingBanner.link || ""}
                    onChange={e => setEditingBanner({...editingBanner, link: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">排序权重</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-600 outline-none transition-all"
                    value={editingBanner.order_index}
                    onChange={e => setEditingBanner({...editingBanner, order_index: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </form>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
              <button 
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveBanner}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-red-100"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
