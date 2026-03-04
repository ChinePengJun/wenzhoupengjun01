/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  ArrowRight,
  MapPin,
  Printer,
  Facebook,
  Youtube,
  Linkedin,
  ArrowUp,
  Menu,
  X,
  Play,
  Filter,
  ArrowLeft,
  ChevronDown,
  Plus,
  Home,
  LayoutGrid,
  BookOpen
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);

  const [categories, setCategories] = useState<string[]>(["全部"]);
  const [products, setProducts] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState({
    companyName: '云浠（温州）包装有限公司',
    address: '浙江省温州龙港市启源路2356-2400',
    phone: '+86-131 6635 1888',
    email: 'wzyunxipack@qq.com',
    copyright: '© 云浠（温州）包装有限公司 版权所有',
  });

  const defaultCatalog = {
    categories: [{ name: "3D滴胶贴纸" }, { name: "不干胶标签" }, { name: "纸袋、包装盒定制" }],
    products: [
      { id: 1, title: "CY CA-1518 定制3D打印环氧树脂防水PET材料手机贴纸流行吻切式包装标签", category: "3D滴胶贴纸", price: "US$0.20-0.23", img: "https://s.alicdn.com/@sc04/kf/H1e4ecf49828942c8aeee85fe6cb532ef1/CY-CA-1518-3D-PET-.jpg?hasNWGrade=1", moq: "3000 pieces", status: "active" },
      { id: 2, title: "批发CY品牌CA-1513型号定制印刷徽标设计3D防水礼品工艺手机壳贴纸A6尺寸PET环氧树脂", category: "3D滴胶贴纸", price: "US$0.20-0.30", img: "https://s.alicdn.com/@sc04/kf/Hb1630189e9a44b0db57da0c63bc03f0fs/-CY-CA-1513-3D-A6-PET.jpg?hasNWGrade=1", moq: "3000 pieces", status: "active" },
      { id: 3, title: "定制 A6 尺寸 3D 圆顶凝胶水晶徽标贴纸 UV 印刷防水 UV 装饰手机后盖礼品及工艺品", category: "不干胶标签", price: "US$0.18-0.28", img: "https://s.alicdn.com/@sc04/kf/H9639f9cf7f0b4c418df3e5750eace15fU/-A6-3D-UV-UV-.jpg?hasNWGrade=1", moq: "3000 pieces", status: "active" },
    ],
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage("detail");
    window.scrollTo(0, 0);
  };

  const filteredProducts = activeCategory === "全部"
    ? products
    : products.filter(p => p.category === activeCategory);

  useEffect(() => {
    const base = (import.meta.env.VITE_ADMIN_API_BASE || '').replace(/\/$/, '');
    const candidates = base ? [base] : ['', 'http://localhost:3000'];

    (async () => {
      for (const candidate of candidates) {
        try {
          const res = await fetch(`${candidate}/api/catalog`);
          if (!res.ok) continue;
          const data = await res.json();
          const hasData = Array.isArray(data.products) && data.products.length > 0;
          if (!hasData) continue;
          const nextCategories = ["全部", ...((data.categories || []).map((item: any) => item.name))];
          setCategories(nextCategories);
          setProducts(data.products || []);
          return;
        } catch {}
      }

      const fallbackCategories = ["全部", ...defaultCatalog.categories.map((item: any) => item.name)];
      setCategories(fallbackCategories);
      setProducts(defaultCatalog.products);
    })();
  }, []);


  useEffect(() => {
    const base = (import.meta.env.VITE_ADMIN_API_BASE || '').replace(/\/$/, '');
    const candidates = base ? [base] : ['', 'http://localhost:3000'];

    (async () => {
      for (const candidate of candidates) {
        try {
          const res = await fetch(`${candidate}/api/site-settings`);
          if (!res.ok) continue;
          const data = await res.json();
          setSiteSettings((prev) => ({ ...prev, ...data }));
          return;
        } catch {}
      }
    })();
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const heroSlides = [
    {
      video: "https://videos.pexels.com/video-files/18338777/18338777-uhd_2560_1440_30fps.mp4",
      title: "3D 滴胶贴纸",
      subtitle: "专业制造",
      desc: "面向全球客户提供高品质、定制化的3D滴胶贴纸批发与生产服务。"
    },
    {
      video: "https://videos.pexels.com/video-files/18338777/18338777-uhd_2560_1440_30fps.mp4",
      title: "不干胶标签",
      subtitle: "高精度印刷",
      desc: "采用先进印刷工艺，确保每一个标签都清晰、耐用、完美呈现品牌形象。"
    },
    {
      video: "https://videos.pexels.com/video-files/18338777/18338777-uhd_2560_1440_30fps.mp4",
      title: "定制包装方案",
      subtitle: "一站式服务",
      desc: "从设计到生产，为您提供全方位的包装解决方案，助力品牌价值提升。"
    }
  ];

  // Auto-play disabled per user request
  /*
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);
  */

  const nextHero = () => setCurrentHeroIdx((prev) => (prev + 1) % heroSlides.length);
  const prevHero = () => setCurrentHeroIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const HomeView = () => (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentHeroIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <video 
                key={heroSlides[currentHeroIdx].video}
                autoPlay 
                muted 
                loop 
                playsInline
                preload="auto"
                className="w-full h-full object-cover brightness-50"
              >
                <source src={heroSlides[currentHeroIdx].video} type="video/mp4" />
                您的浏览器不支持视频播放。
              </video>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentHeroIdx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <h1 className="text-4xl md:text-7xl font-black mb-4 leading-tight">
                {heroSlides[currentHeroIdx].title}<br />
                <span className="text-hanke-red">{heroSlides[currentHeroIdx].subtitle}</span>
              </h1>
              <p className="text-lg md:text-2xl font-light mb-8 opacity-90">
                {heroSlides[currentHeroIdx].desc}
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => { setCurrentPage("products"); window.scrollTo(0,0); }} className="bg-hanke-red hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 group">
                  立即咨询
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentHeroIdx(idx)}
              className={`w-12 h-1.5 rounded-full transition-all cursor-pointer ${idx === currentHeroIdx ? "bg-hanke-red" : "bg-white/30 hover:bg-white/50"}`}
            ></div>
          ))}
        </div>

        <button 
          onClick={prevHero}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
        >
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <button 
          onClick={nextHero}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
        >
          <ChevronRight size={20} className="md:w-6 md:h-6" />
        </button>
      </section>

      {/* Product Center */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">产品中心</h2>
              <div className="w-20 h-1.5 bg-hanke-red"></div>
            </div>
            <button onClick={() => { setCurrentPage("products"); window.scrollTo(0,0); }} className="text-gray-500 hover:text-hanke-red transition-colors flex items-center gap-1 font-medium text-sm md:text-base">
              查看全部产品 <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map((product, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => handleProductClick(product)}
                className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                  <img 
                    src={product.img} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-xs md:text-sm font-medium mb-2 line-clamp-2 h-8 md:h-10">{product.title}</h3>
                  <p className="text-hanke-red font-bold text-sm md:text-base">{product.price}</p>
                  <p className="text-[10px] text-gray-400 mt-1">最小起订量: {product.moq || "1000 片"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">为什么选择我们</h2>
            <div className="w-20 h-1.5 bg-hanke-red mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { title: "支持定制", desc: "STAND BY CUSTOM MADE", icon: <Printer size={28} className="md:w-8 md:h-8" /> },
              { title: "严格质检", desc: "STRICT QUALITY CONTROL", icon: <Globe size={28} className="md:w-8 md:h-8" /> },
              { title: "10年经验", desc: "10 YEARS EXPERIENCE", icon: <Calendar size={28} className="md:w-8 md:h-8" /> },
              { title: "提供样品", desc: "PROVIDE THE SAMPLE", icon: <MessageSquare size={28} className="md:w-8 md:h-8" /> },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  {item.icon}
                </div>
                <h4 className="text-base md:text-lg font-bold mb-1 md:mb-2">{item.title}</h4>
                <p className="text-[8px] md:text-xs text-gray-400 uppercase tracking-widest leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const ProductCatalogView = () => (
    <div className="pt-20 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <section className="bg-hanke-dark py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">产品中心</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            探索我们多样化的3D滴胶贴纸系列。我们提供从设计到生产的全方位定制服务，满足您的品牌展示需求。
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar Filter */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm lg:sticky lg:top-24">
            <h3 className="font-bold text-lg mb-4 lg:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-hanke-red"></div>
              产品分类
            </h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              <div className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 shrink-0 border border-gray-100">
                <Filter size={18} />
              </div>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-4 py-2 md:py-3 rounded-xl transition-all font-medium whitespace-nowrap lg:whitespace-normal ${
                    activeCategory === cat 
                      ? "bg-hanke-red text-white shadow-md shadow-red-200" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hidden lg:block mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">需要定制？</h4>
              <p className="text-sm text-blue-700 mb-4">上传您的设计，我们为您提供免费打样服务。</p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                立即咨询
              </button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-500">共找到 <span className="text-hanke-dark font-bold">{filteredProducts.length}</span> 款产品</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">排序:</span>
              <select className="bg-transparent font-bold text-hanke-dark outline-none cursor-pointer">
                <option>默认排序</option>
                <option>最新发布</option>
                <option>价格从低到高</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={product.img} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold text-hanke-red uppercase tracking-wider shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-3 md:p-6">
                  <h3 className="font-bold text-hanke-dark mb-1 md:mb-2 line-clamp-2 h-8 md:h-12 group-hover:text-hanke-red transition-colors text-xs md:text-base">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 md:mt-4">
                    <div>
                      <p className="text-hanke-red font-black text-sm md:text-xl">{product.price}</p>
                      <p className="text-[8px] md:text-[10px] text-gray-400 mt-0.5 md:mt-1">最小起订量: {product.moq || "1000 片"}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-hanke-dark hover:bg-hanke-red hover:text-white transition-all shadow-inner"
                    >
                      <ArrowRight size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Customization Process */}
          <section className="mt-16 md:mt-24 bg-white p-6 md:p-12 rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-black mb-2">定制流程</h2>
              <p className="text-sm md:text-base text-gray-400">简单四步，开启您的品牌定制之旅</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
              {[
                { step: "01", title: "提交需求", desc: "提供您的Logo、尺寸及材质要求" },
                { step: "02", title: "设计确认", desc: "我们的设计师为您制作效果图" },
                { step: "03", title: "免费打样", desc: "确认设计后，我们为您制作样品" },
                { step: "04", title: "批量生产", desc: "样品确认无误后，开始大货生产" },
              ].map((item, i) => (
                <div key={i} className="text-center relative z-10">
                  <div className="text-3xl md:text-5xl font-black text-gray-100 mb-2 md:mb-4">{item.step}</div>
                  <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2">{item.title}</h4>
                  <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
              <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gray-100 -z-0"></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const ProductDetailView = ({ product }: { product: any }) => {
    if (!product) return null;
    const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
    const [activeTab, setActiveTab] = useState("照片");
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setIsVideoPlaying(false);
    }, [currentMediaIdx]);

    const checkScroll = () => {
      if (thumbRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = thumbRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    useEffect(() => {
      const el = thumbRef.current;
      if (el) {
        el.addEventListener('scroll', checkScroll);
        // Initial check
        checkScroll();
        // Check on window resize
        window.addEventListener('resize', checkScroll);
        return () => {
          el.removeEventListener('scroll', checkScroll);
          window.removeEventListener('resize', checkScroll);
        };
      }
    }, []);

    const productImages = [product.img, ...((product.thumbnails || []) as string[])].filter(Boolean);
    const productMedia = [
      { type: "video" as const, url: (product.videoUrl || "https://videos.pexels.com/video-files/18338777/18338777-uhd_2560_1440_30fps.mp4"), poster: product.img },
      ...productImages.map((url) => ({ type: "image" as const, url })),
    ];

    const nextMedia = () => setCurrentMediaIdx((prev) => (prev + 1) % productMedia.length);
    const prevMedia = () => setCurrentMediaIdx((prev) => (prev - 1 + productMedia.length) % productMedia.length);

    const scrollThumb = (direction: 'left' | 'right') => {
      if (thumbRef.current) {
        const scrollAmount = 200;
        thumbRef.current.scrollBy({
          left: direction === 'right' ? scrollAmount : -scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    return (
      <div className="pt-20 md:pt-24 pb-16 md:pb-24 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs & Back Button */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar pr-4">
              <button onClick={() => setCurrentPage("home")} className="hover:text-hanke-red">首页</button>
              <ChevronRight size={12} className="shrink-0" />
              <button onClick={() => setCurrentPage("products")} className="hover:text-hanke-red">产品中心</button>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-hanke-dark font-medium truncate max-w-[100px] md:max-w-[200px]">{product.title}</span>
            </div>
            <button 
              onClick={() => setCurrentPage("products")}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-hanke-dark bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
            >
              <ArrowLeft size={14} /> 返回
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 md:mb-16">
            {/* Left: Images - Wider column for 800x520 container */}
            <div className="lg:col-span-8">
              <div className="relative group max-w-[800px]">
                <div className="relative bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4 aspect-square md:aspect-[800/520]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMediaIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full relative flex items-center justify-center"
                    >
                      {productMedia[currentMediaIdx].type === "video" ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-white">
                          <video 
                            id={`video-${product.id}`}
                            className={`transition-all duration-300 ${isVideoPlaying ? 'w-full h-full object-cover' : 'w-full h-full md:w-[550px] md:h-[309px] object-cover'}`}
                            controls
                            poster={productMedia[currentMediaIdx].poster}
                            playsInline
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onEnded={() => setIsVideoPlaying(false)}
                          >
                            <source src={productMedia[currentMediaIdx].url} type="video/mp4" />
                            您的浏览器不支持视频播放。
                          </video>
                          {/* Large Play Button Overlay - hidden when playing */}
                          {!isVideoPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
                                <Play size={32} className="text-white fill-white ml-1 md:w-10 md:h-10" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white">
                          <img 
                            src={productMedia[currentMediaIdx].url} 
                            alt={product.title} 
                            className="w-full h-full md:w-[520px] md:h-[520px] object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
                <button 
                  onClick={prevMedia}
                  className="hidden md:flex absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg items-center justify-center text-gray-600 hover:text-hanke-dark transition-all z-10"
                >
                  <ChevronLeft size={24} className="md:w-8 md:h-8" />
                </button>
                <button 
                  onClick={nextMedia}
                  className="hidden md:flex absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg items-center justify-center text-gray-600 hover:text-hanke-dark transition-all z-10"
                >
                  <ChevronRight size={24} className="md:w-8 md:h-8" />
                </button>
              </div>
              <div className="flex items-center gap-2 md:gap-3 group/thumb relative">
                {canScrollLeft && (
                  <button 
                    onClick={() => scrollThumb('left')}
                    className="absolute left-[-12px] md:left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-hanke-dark bg-white/80 backdrop-blur-sm shadow-md rounded-full transition-all z-20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div 
                  ref={thumbRef}
                  className="flex gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
                >
                  {productMedia.map((item, i) => (
                    <div 
                      key={i} 
                      onMouseEnter={() => setCurrentMediaIdx(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg md:rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative ${i === currentMediaIdx ? "border-hanke-red shadow-sm" : "border-transparent hover:border-gray-200"}`}
                    >
                      <img src={item.type === 'video' ? item.poster : item.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50">
                            <Play size={12} className="text-white fill-white ml-0.5 md:w-4 md:h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {canScrollRight && (
                  <button 
                    onClick={() => scrollThumb('right')}
                    className="absolute right-[-12px] md:right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-hanke-dark bg-white/80 backdrop-blur-sm shadow-md rounded-full transition-all z-20"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Info - Narrower column */}
            <div className="lg:col-span-4">
              <div className="mb-4 md:mb-6">
                <h1 className="text-xl md:text-3xl font-black text-hanke-dark leading-tight">
                  {product.title}
                </h1>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-8">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 md:px-3 md:py-1 rounded-md text-[10px] md:text-xs font-bold">可定制</span>
                  <span className="text-gray-400 text-[10px] md:text-xs flex items-center gap-1">无忧退货 <Globe size={10} className="md:w-3 md:h-3" /></span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8 border-b border-gray-100 pb-6 md:pb-8 mb-6 md:mb-8">
                  {product.tiers?.map((tier: any, i: number) => (
                    <div key={i}>
                      <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">{tier.range}</p>
                      <p className="text-base md:text-2xl font-black text-hanke-red">{tier.price}</p>
                    </div>
                  )) || (
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">最小起订量: {product.moq}</p>
                      <p className="text-base md:text-2xl font-black text-hanke-red">{product.price}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="text-xs md:text-sm text-gray-400 w-16 md:w-20 shrink-0">颜色分类:</span>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-hanke-red p-1 cursor-pointer">
                        <img src={product.img} alt="Color" className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="text-xs md:text-sm text-gray-400 w-16 md:w-20 shrink-0">尺寸:</span>
                    <button className="px-3 py-1.5 md:px-4 md:py-2 border-2 border-hanke-red text-hanke-red rounded-lg text-xs md:text-sm font-bold">Customized</button>
                  </div>
                  <div className="flex items-start gap-4 md:gap-8">
                    <span className="text-xs md:text-sm text-gray-400 w-16 md:w-20 shrink-0 mt-1">定制选项:</span>
                    <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
                      <li className="flex items-center gap-2">定制logo <span className="text-gray-400">(最小订单: 3,000 pieces)</span></li>
                      <li className="flex items-center gap-2">定制包装 <span className="text-gray-400">(最小订单: 3,000 pieces)</span></li>
                      <li className="flex items-center gap-2">图形自定义 <span className="text-gray-400">(最小订单: 3,000 pieces)</span></li>
                    </ul>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-2 gap-3 md:gap-4 mt-8 md:mt-12">
                  <button className="bg-hanke-red text-white py-3 md:py-4 rounded-full font-bold text-sm md:text-base hover:bg-red-700 transition-all shadow-lg shadow-red-200">发送询盘</button>
                  <button className="border-2 border-hanke-dark text-hanke-dark py-3 md:py-4 rounded-full font-bold text-sm md:text-base hover:bg-hanke-dark hover:text-white transition-all">联系商家</button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Footer */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button className="flex-1 bg-hanke-red text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-red-100">发送询盘</button>
            <button className="flex-1 border-2 border-hanke-dark text-hanke-dark py-3 rounded-full font-bold text-sm">联系商家</button>
          </div>

          {/* Tabs Content */}
          <div className="bg-white rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-12 md:mb-16">
            <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap">
              {["照片","属性"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 md:px-12 py-4 md:py-6 font-bold text-base md:text-lg transition-all relative ${
                    activeTab === tab ? "text-hanke-red" : "text-gray-400 hover:text-hanke-dark"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-hanke-red"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="p-6 md:p-12">
              {activeTab === "属性" && (
                <>
                  <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8">重要属性</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-2 md:gap-y-4">
                    {[
                      { label: "行业应用", value: "礼品和工艺品" },
                      { label: "材质", value: product.specs?.material || "聚乙烯对苯二甲酸酯（塑料）" },
                      { label: "类型", value: product.specs?.type || "3D Sticker" },
                      { label: "特性", value: product.specs?.feature || "waterproof" },
                      { label: "印刷处理", value: product.specs?.printing || "Customized" },
                      { label: "标签形状", value: product.specs?.shape || "Customized" },
                      { label: "核心直径", value: "Customized" },
                      { label: "接受定制", value: "是" },
                      { label: "型号", value: "CA-1518" },
                      { label: "原产地", value: "Zhejiang, China" },
                      { label: "品牌", value: product.specs?.brand || "CY" },
                    ].map((attr, i) => (
                      <div key={i} className="flex border-b border-gray-50 py-3 md:py-4">
                        <span className="w-24 md:w-32 text-gray-400 text-xs md:text-sm shrink-0">{attr.label}</span>
                        <span className="text-hanke-dark font-medium text-sm md:text-base">{attr.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-16">
                    <h2 className="text-2xl font-black mb-8">包装和发货信息</h2>
                    <div className="flex border border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-8 py-4 w-48 font-bold text-gray-500 border-r border-gray-100">销售单位</div>
                      <div className="px-8 py-4">单一商品</div>
                    </div>
                  </div>

                  <div className="mt-16">
                    <h2 className="text-2xl font-black mb-8">交货时间</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-400 text-sm">
                            <th className="px-8 py-4 border border-gray-100">数量 (pieces)</th>
                            <th className="px-8 py-4 border border-gray-100">1 - 5,000</th>
                            <th className="px-8 py-4 border border-gray-100">5,001 - 50,000</th>
                            <th className="px-8 py-4 border border-gray-100">&gt; 50,000</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-8 py-4 border border-gray-100 font-bold text-gray-500">美国东部时间 (天)</td>
                            <td className="px-8 py-4 border border-gray-100">7</td>
                            <td className="px-8 py-4 border border-gray-100">30</td>
                            <td className="px-8 py-4 border border-gray-100">待定</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "照片" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {productMedia.filter(m => m.type === 'image').map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <img src={img.url} alt={`Detail ${i}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="md:col-span-2 bg-gray-50 p-8 md:p-12 rounded-3xl text-center">
                    <h3 className="text-xl font-bold mb-4">更多实拍图</h3>
                    <p className="text-gray-500 mb-8">由于光线和显示器不同，实物与图片可能存在轻微色差，请以实物为准。</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <img key={i} src={`https://picsum.photos/seed/detail-${product.id}-${i}/400/400`} className="rounded-xl shadow-sm" referrerPolicy="no-referrer" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Section - Netflix Style */}
              <div className="mt-16 md:mt-24">
                <h2 className="text-2xl md:text-3xl font-black mb-8 text-hanke-dark">常见问题解答</h2>
                <div className="space-y-2">
                  {[
                    { q: "我们能得到一些样品吗？有收费吗？", a: "是的，你可以从我们的库存中获得可用的样品。真正的样品是免费的，但是你需要承担运费。" },
                    { q: "我们如何获得报价？", a: "请提供产品的规格，如材料、尺寸、形状、颜色、数量、表面精加工等。" },
                    { q: "您要打印什么格式的设计文件？", a: "PDF; CDR; 高DPI JPG。" },
                    { q: "您能帮忙设计吗？", a: "是的，我们有5名专业设计师，他们可以通过提供简单的信息，如徽标和一些图像来提供帮助。" },
                    { q: "贸易术语和付款条件是什么？", a: "生产前应支付总价值的100% 或50%。接受T/T, WU, L/C, Paypal和现金。可以协商。" },
                    { q: "我可以用自己的设计制作一个新样品进行确认吗？", a: "是的。" },
                    { q: "交货时间怎么样？", a: "这取决于产品。通常，在设计文件确认并汇款后，需要5到8个工作日。" },
                  ].map((faq, i) => (
                    <div key={i} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <button 
                        onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                      >
                        <span className="text-lg md:text-2xl font-medium text-hanke-dark pr-8">{faq.q}</span>
                        <div className="shrink-0">
                          {openFaqIdx === i ? (
                            <X size={32} className="text-hanke-dark" />
                          ) : (
                            <Plus size={32} className="text-hanke-dark" />
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {openFaqIdx === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-white">
                              <p className="text-lg md:text-2xl text-gray-600 leading-relaxed font-light">
                                {faq.a}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <section>
            <h2 className="text-3xl font-black mb-12">其他推荐</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} onClick={() => handleProductClick(p)} className="group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-sm">
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="font-bold text-sm mb-2 line-clamp-2 h-10 group-hover:text-hanke-red transition-colors">{p.title}</h4>
                  <p className="text-hanke-red font-black">{p.price}</p>
                  <p className="text-[10px] text-gray-400 mt-1">MOQ: 3000 pieces</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const ContactView = () => (
    <div className="pt-20">
      {/* Contact Hero */}
      <section className="relative h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/contact-bg/1920/800" 
            alt="Contact Hero" 
            className="w-full h-full object-cover brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl"
          >
            <h1 className="text-3xl md:text-5xl font-black text-hanke-red mb-4 md:mb-6">携手共创未来</h1>
            <p className="text-base md:text-lg text-hanke-dark leading-relaxed font-medium">
              欢迎来到云浠，一家专业的中国3D滴胶贴纸制造商。我们专注于高效批量生产高品质3D滴胶贴纸。
            </p>
          </motion.div>
        </div>

        {/* Floating Icons Box */}
        <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hidden lg:flex gap-8 shadow-2xl">
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Phone size={24} /></div>
          </div>
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Mail size={24} /></div>
          </div>
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">@</div>
          </div>
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><MessageSquare size={24} /></div>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
          {/* Left: Info */}
          <div>
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-hanke-red flex items-center justify-center text-hanke-red">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-hanke-red"></div>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-hanke-red uppercase tracking-tight">Contact Yunxi</h2>
            </div>

            <div className="space-y-6 md:space-y-10">
              {[
                { icon: <Printer size={20} className="md:w-6 md:h-6" />, label: "Company Name", value: siteSettings.companyName },
                { icon: <MapPin size={20} className="md:w-6 md:h-6" />, label: "Address", value: siteSettings.address },
                { icon: <Phone size={20} className="md:w-6 md:h-6" />, label: "Phone:", value: siteSettings.phone },
                { icon: <Mail size={20} className="md:w-6 md:h-6" />, label: "E-mail:", value: siteSettings.email },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 md:gap-6 group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-hanke-red text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-red-100">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-hanke-dark mb-0.5 md:mb-1">{item.label}</h4>
                    <p className="text-xs md:text-sm text-gray-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-gray-50 p-6 md:p-12 rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl md:text-4xl font-black text-hanke-red mb-2 md:mb-4">Get a Free Quote</h2>
            <p className="text-xs md:text-base text-gray-400 mb-6 md:mb-10">我们的代表将很快与您联系。</p>

            <form className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[10px] md:text-sm font-bold text-gray-400 mb-1 md:mb-2 uppercase tracking-wider">Email <span className="text-hanke-red">*</span></label>
                <input type="email" placeholder="Please enter your email address" className="w-full bg-white border border-gray-200 rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:border-hanke-red transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] md:text-sm font-bold text-gray-400 mb-1 md:mb-2 uppercase tracking-wider">Name</label>
                <input type="text" placeholder="Please enter your name" className="w-full bg-white border border-gray-200 rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:border-hanke-red transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] md:text-sm font-bold text-gray-400 mb-1 md:mb-2 uppercase tracking-wider">Company Name</label>
                <input type="text" placeholder="Please enter your company name" className="w-full bg-white border border-gray-200 rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:border-hanke-red transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] md:text-sm font-bold text-gray-400 mb-1 md:mb-2 uppercase tracking-wider">Message</label>
                <textarea rows={4} placeholder="Please enter your message" className="w-full bg-white border border-gray-200 rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:border-hanke-red transition-colors resize-none"></textarea>
              </div>
              <button className="w-full bg-hanke-red text-white py-4 md:py-5 rounded-full font-black text-base md:text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-100 uppercase tracking-widest">
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-16 md:py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="absolute inset-0 z-0 opacity-20">
            <img 
              src="https://picsum.photos/seed/worldmap/1200/600" 
              alt="World Map" 
              className="w-full h-full object-contain grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 h-[300px] md:h-[600px] flex items-center justify-center">
            {/* Headquarters Marker */}
            <div className="absolute top-[35%] left-[75%] group">
              <div className="w-4 h-4 md:w-8 md:h-8 rounded-full border-2 md:border-4 border-hanke-red bg-white animate-ping absolute inset-0"></div>
              <div className="w-4 h-4 md:w-8 md:h-8 rounded-full border-2 md:border-4 border-hanke-red bg-white relative z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-hanke-red"></div>
              </div>
              <div className="absolute top-full mt-2 md:mt-4 left-1/2 -translate-x-1/2 bg-hanke-dark text-white px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-xl whitespace-nowrap shadow-2xl scale-75 md:scale-100">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-lg md:text-2xl font-black text-hanke-red tracking-tighter">YUNXI</div>
                  <div className="w-px h-4 md:h-6 bg-white/20"></div>
                  <div className="font-bold text-xs md:text-base">Headquarters</div>
                </div>
              </div>
            </div>

            {/* Global Presence Markers */}
            {[
              { top: '25%', left: '25%', label: 'North America' },
              { top: '45%', left: '30%', label: 'South America' },
              { top: '30%', left: '55%', label: 'Europe' },
              { top: '50%', left: '50%', label: 'Africa' },
              { top: '40%', left: '65%', label: 'Middle East' },
              { top: '60%', left: '80%', label: 'Australia' },
              { top: '35%', left: '85%', label: 'East Asia' },
            ].map((marker, i) => (
              <div key={i} className="absolute" style={{ top: marker.top, left: marker.left }}>
                <div className="w-6 h-6 rounded-full bg-hanke-red/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-hanke-red"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const AboutView = () => (
    <div className="pt-20">
      {/* About Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://sc04.alicdn.com/kf/H3e3f753b8b95482ca17b1094c80b2536Z/284680422/H3e3f753b8b95482ca17b1094c80b2536Z.jpg" 
            alt="About Us Building" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-6xl font-black text-white tracking-widest uppercase">
            <span className="text-hanke-red mr-2 md:mr-4">♦</span>
            关于我们
            <span className="text-hanke-red ml-2 md:ml-4">♦</span>
          </h1>
        </div>
      </section>

      {/* Company Intro */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 text-blue-500">云浠（温州）包装有限公司</h2>
            <div className="space-y-4 md:space-y-6 text-gray-600 leading-relaxed text-base md:text-lg">
              <p>
                是一家专业生产加工包装盒、不干胶标签、纸盒等产品的公司，拥有完整、科学的质量管理体系。
              </p>
              <p>
                云浠（温州）包装有限公司的诚信、实力和产品质量获得业界的认可。欢迎各界朋友莅临参观、指导和业务洽谈。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-lg aspect-video md:aspect-auto">
              <img src="https://picsum.photos/seed/office1/800/400" alt="Office" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-lg aspect-video md:aspect-auto">
              <img src="https://picsum.photos/seed/office2/800/400" alt="Office" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Production Line */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden shadow-xl aspect-video md:aspect-auto">
                <img src={`https://picsum.photos/seed/factory${i}/800/600`} alt={`Production ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 bg-blue-500 text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-lg md:text-xl rounded-bl-2xl">
                  {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-black mb-12 md:mb-16 text-blue-500 uppercase tracking-widest">
            <span className="text-hanke-red mr-2 md:mr-4">♦</span>
            公司证书
            <span className="text-hanke-red ml-2 md:ml-4">♦</span>
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-8">
            <div className="w-48 md:w-64">
              <img src="https://picsum.photos/seed/trophy/400/600" alt="Trophy" className="w-full h-auto" referrerPolicy="no-referrer" />
            </div>
            <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 md:pb-0 max-w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-32 md:w-48 shrink-0 border border-gray-200 p-2 bg-white shadow-sm">
                  <img src={`https://picsum.photos/seed/cert${i}/300/400`} alt={`Cert ${i}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team / Contact Us */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-black mb-12 md:mb-16 text-blue-500 uppercase tracking-widest">
            <span className="text-hanke-red mr-2 md:mr-4">♦</span>
            联系我们
            <span className="text-hanke-red ml-2 md:ml-4">♦</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { name: "LuLu", img: "https://picsum.photos/seed/lulu/300/300" },
              { name: "David", img: "https://picsum.photos/seed/david/300/300" },
              { name: "Lucy", img: "https://picsum.photos/seed/lucy/300/300" },
            ].map((member, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 md:mb-6">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-blue-600 italic">{member.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || currentPage !== "home" ? "bg-white shadow-md py-2" : "bg-black/20 backdrop-blur-sm py-4"}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentPage("home"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="flex items-baseline">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-hanke-red">YUNXI</span>
              <span className={`text-lg md:text-xl font-bold ml-1 ${isScrolled || currentPage !== "home" ? "text-hanke-dark" : "text-white"}`}>云浠</span>
            </div>
          </div>
          
          <div className={`hidden lg:flex items-center gap-8 ${isScrolled || currentPage !== "home" ? "text-hanke-dark" : "text-white"}`}>
            <button onClick={() => setCurrentPage("home")} className={`nav-link ${currentPage === "home" ? "text-hanke-red" : ""}`}>首页</button>
            <button onClick={() => setCurrentPage("about")} className={`nav-link ${currentPage === "about" ? "text-hanke-red" : ""}`}>关于我们</button>
            <button onClick={() => setCurrentPage("products")} className={`nav-link ${currentPage === "products" ? "text-hanke-red" : ""}`}>产品中心</button>
            <button onClick={() => setCurrentPage("contact")} className={`nav-link ${currentPage === "contact" ? "text-hanke-red" : ""}`}>联系我们</button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className={`p-2 rounded-full transition-colors ${isScrolled || currentPage !== "home" ? "hover:bg-gray-100 text-hanke-dark" : "hover:bg-white/10 text-white"}`}>
              <Search size={18} className="md:w-5 md:h-5" />
            </button>
            <div className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-full border transition-colors cursor-pointer ${isScrolled || currentPage !== "home" ? "border-gray-200 text-hanke-dark hover:bg-gray-50" : "border-white/30 text-white hover:bg-white/10"}`}>
              <Globe size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider">CN</span>
              <ChevronRight size={10} className="rotate-90" />
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors ${isScrolled || currentPage !== "home" ? "hover:bg-gray-100 text-hanke-dark" : "hover:bg-white/10 text-white"}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-2">
                {[
                  { id: "home", label: "首页" },
                  { id: "about", label: "关于我们" },
                  { id: "products", label: "产品中心", subItems: categories },
                  { id: "contact", label: "联系我们" },
                ].map((item) => (
                  <div key={item.id} className="flex flex-col">
                    <div className="flex items-center">
                      <button
                        onClick={() => { 
                          if (item.subItems) {
                            setIsProductsExpanded(!isProductsExpanded);
                          } else {
                            setCurrentPage(item.id); 
                            setIsMenuOpen(false); 
                            window.scrollTo(0,0); 
                          }
                        }}
                        className={`flex-grow text-left px-6 py-4 rounded-xl font-bold transition-colors ${currentPage === item.id && !item.subItems ? "bg-hanke-red text-white" : "text-hanke-dark hover:bg-gray-50"}`}
                      >
                        {item.label}
                      </button>
                      {item.subItems && (
                        <button 
                          onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                          className={`p-4 transition-colors ${isProductsExpanded ? "text-hanke-red" : "text-hanke-dark"}`}
                        >
                          <ChevronDown size={20} className={`transition-transform duration-300 ${isProductsExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    
                    {item.subItems && (
                      <AnimatePresence>
                        {isProductsExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden bg-gray-50/50 rounded-xl mx-2 mb-2"
                          >
                            <div className="flex flex-col p-2 gap-1">
                              {item.subItems.map((sub) => (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    setCurrentPage("products");
                                    setActiveCategory(sub);
                                    setIsMenuOpen(false);
                                    window.scrollTo(0, 0);
                                  }}
                                  className={`text-left px-6 py-3 rounded-lg text-sm font-medium transition-colors ${activeCategory === sub && currentPage === "products" ? "text-hanke-red bg-white shadow-sm" : "text-gray-500 hover:bg-white"}`}
                                >
                                  {sub}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {currentPage === "home" ? (
          <HomeView />
        ) : currentPage === "about" ? (
          <AboutView />
        ) : currentPage === "products" ? (
          <ProductCatalogView />
        ) : currentPage === "contact" ? (
          <ContactView />
        ) : (
          <ProductDetailView product={selectedProduct} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-hanke-dark text-white pt-16 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-t border-white/10 pt-12 md:pt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 mb-12 md:mb-24">
              <div className="lg:col-span-1">
                <h4 className="text-lg font-bold mb-8 text-white">联系信息</h4>
                <div className="space-y-4 md:space-y-6 text-gray-400 text-xs md:text-sm">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-hanke-red shrink-0 md:w-5 md:h-5" />
                  <p>地址：{siteSettings.address}</p>
                </div>
                <div className="flex gap-3">
                  <Phone size={18} className="text-hanke-red shrink-0 md:w-5 md:h-5" />
                  <p>电话：{siteSettings.phone}</p>
                </div>
                <div className="flex gap-3">
                  <Mail size={18} className="text-hanke-red shrink-0 md:w-5 md:h-5" />
                  <p>邮箱：{siteSettings.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8 text-hanke-red">产品中心</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                {categories.filter((cat) => cat !== "全部").map((cat) => (
                  <li key={cat}>
                    <button onClick={() => { setCurrentPage("products"); setActiveCategory(cat); window.scrollTo(0,0); }} className="hover:text-white transition-colors">{cat}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex gap-4 mb-8">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-hanke-red transition-colors">
                  <Youtube size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-hanke-red transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-hanke-red transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="aspect-square bg-white p-2 rounded-lg mb-2">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=YunxiTech" alt="QR Code" className="w-full h-full" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">技术支持</p>
                </div>
                <div className="text-center">
                  <div className="aspect-square bg-white p-2 rounded-lg mb-2">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=YunxiSales" alt="QR Code" className="w-full h-full" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">在线销售</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-gray-500">
            <p>{siteSettings.copyright}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">隐私政策</a>
              <a href="#" className="hover:text-white transition-colors">博客</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sidebar (Desktop Only) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col bg-[#2A2524] shadow-2xl border-l border-white/10">
        {[
          { icon: <Phone size={24} />, label: siteSettings.phone, action: () => window.location.href = `tel:${siteSettings.phone}` },
          { icon: <Mail size={24} />, label: siteSettings.email, action: () => window.location.href = `mailto:${siteSettings.email}` },
          { icon: <MessageSquare size={24} />, label: "+86-13296759287", action: () => setCurrentPage("contact") },
          { icon: <MessageSquare size={24} />, label: "获取报价", action: () => setCurrentPage("contact") },
        ].map((item, i) => (
          <div key={i} className="group relative border-b border-white/10 last:border-b-0">
            <button 
              onClick={() => { item.action(); window.scrollTo(0,0); }}
              className="w-16 h-16 text-white flex items-center justify-center hover:bg-hanke-red transition-all duration-300"
            >
              {item.icon}
            </button>
            {/* Hover Expansion */}
            <div className="absolute right-full top-0 h-full bg-[#2A2524] flex items-center px-6 text-white text-sm font-medium whitespace-nowrap opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none border-r border-white/10">
              {item.label}
            </div>
          </div>
        ))}
        
        {/* Back to Top Button - Integrated into sidebar style */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/20"
            >
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-16 h-16 bg-hanke-red text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                title="回到顶部"
              >
                <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 w-full z-50 lg:hidden bg-[#2A2524] border-t border-white/10 flex items-stretch h-16">
        {[
          { id: "home", label: "Home", icon: <Home size={20} /> },
          { id: "products", label: "Product", icon: <LayoutGrid size={20} /> },
          { id: "about", label: "About", icon: <BookOpen size={20} /> },
          { id: "contact", label: "Contact", icon: <Mail size={20} /> },
        ].map((item, i) => (
          <button
            key={item.id}
            onClick={() => { setCurrentPage(item.id); window.scrollTo(0,0); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${i !== 0 ? "before:content-[''] before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-[1px] before:bg-hanke-red/50" : ""} ${currentPage === item.id ? "text-hanke-red" : "text-white"}`}
          >
            <div className={`${currentPage === item.id ? "scale-110" : "scale-100"} transition-transform`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
