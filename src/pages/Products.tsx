import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ArrowRight, Grid, List } from "lucide-react";
import { motion } from "motion/react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

interface Product {
  id: number;
  title: string;
  category: string;
  price: string;
  img: string;
  description: string;
  isFeatured: number;
}

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(t('cat.all'));
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: 'cat.all', label: t('cat.all') },
    { id: 'cat.epoxy', label: t('cat.epoxy') },
    { id: 'cat.labels', label: t('cat.labels') },
    { id: 'cat.boxes', label: t('cat.boxes') },
    { id: 'cat.bags', label: t('cat.bags') }
  ];

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    let result = products;
    // Map the translated label back to the original category name if needed, 
    // but the backend stores them in Chinese. We should probably filter by the original Chinese name or ID.
    // For now, let's assume the category in DB matches the Chinese translation.
    
    const categoryMap: Record<string, string> = {
      [t('cat.all')]: "全部",
      [t('cat.epoxy')]: "3D滴胶贴纸",
      [t('cat.labels')]: "不干胶标签",
      [t('cat.boxes')]: "定制包装盒",
      [t('cat.bags')]: "纸袋/手提袋"
    };

    const dbCategory = categoryMap[activeCategory];

    if (dbCategory && dbCategory !== "全部") {
      result = result.filter(p => p.category === dbCategory);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [activeCategory, searchQuery, products, t]);

  return (
    <main className="pt-32 pb-32">
      <SEO 
        title={t('products.seo.title')}
        description={t('products.seo.desc')}
        keywords="滴胶贴纸产品, 不干胶标签目录, 包装盒定制, 云浠包装产品"
      />

      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Product Catalog</span>
          <h1 className="text-5xl md:text-7xl font-black text-yunxi-dark tracking-tighter mb-8">{t('products.title')}</h1>
          <p className="text-xl text-yunxi-dark/50 font-medium max-w-3xl">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-16 p-8 bg-yunxi-gray rounded-3xl">
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.label)}
                className={`px-8 py-3 rounded-full text-sm font-black transition-all ${activeCategory === cat.label ? "bg-yunxi-red text-white shadow-lg shadow-yunxi-red/20" : "bg-white text-yunxi-dark hover:bg-yunxi-dark hover:text-white"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yunxi-dark/30" size={20} />
            <input 
              type="text" 
              placeholder={t('products.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-white rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yunxi-red/20 transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-yunxi-gray rounded-3xl mb-6"></div>
                <div className="h-6 bg-yunxi-gray rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-yunxi-gray rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/products/${product.id}`} className="block relative aspect-square rounded-3xl overflow-hidden bg-yunxi-gray mb-6">
                  <img 
                    src={product.img} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black text-yunxi-dark uppercase tracking-widest rounded-full shadow-sm">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-yunxi-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-yunxi-dark scale-50 group-hover:scale-100 transition-transform duration-500">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Link>
                <h3 className="text-2xl font-black text-yunxi-dark mb-2 group-hover:text-yunxi-red transition-colors">{product.title}</h3>
                <p className="text-yunxi-dark/40 font-bold mb-6 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-yunxi-dark/5">
                  <span className="text-2xl font-black text-yunxi-red">{product.price}</span>
                  <Link to={`/products/${product.id}`} className="px-6 py-3 bg-yunxi-dark text-white text-xs font-black rounded-full hover:bg-yunxi-red transition-all">
                    {t('products.viewDetails')}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-yunxi-gray rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-yunxi-dark/20" />
            </div>
            <h3 className="text-2xl font-black text-yunxi-dark mb-2">{t('products.noFound')}</h3>
            <p className="text-yunxi-dark/40 font-bold">{t('products.tryAdjust')}</p>
            <button 
              onClick={() => { setActiveCategory(t('cat.all')); setSearchQuery(""); }}
              className="mt-8 text-yunxi-red font-black hover:underline"
            >
              {t('products.reset')}
            </button>
          </div>
        )}
      </section>

      {/* Customization CTA */}
      <section className="max-w-7xl mx-auto px-6 mt-40">
        <div className="bg-yunxi-dark rounded-[40px] p-12 md:p-24 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-8">
                {t('products.custom.title')}
              </h2>
              <p className="text-xl text-white/40 font-bold mb-12">
                {t('products.custom.desc')}
              </p>
              <Link to="/contact" className="inline-flex items-center gap-4 px-10 py-5 bg-yunxi-red text-white font-black rounded-full hover:bg-white hover:text-yunxi-dark transition-all">
                {t('products.custom.cta')}
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: t('products.adv.sampling'), sub: "Free Sampling" },
                { label: t('products.adv.delivery'), sub: "Fast Delivery" },
                { label: t('products.adv.moq'), sub: "Low MOQ" },
                { label: t('products.adv.design'), sub: "Pro Design" }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-2xl font-black text-white mb-1">{item.label}</p>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
