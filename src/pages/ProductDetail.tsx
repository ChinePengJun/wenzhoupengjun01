import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MessageSquare, Share2, ShieldCheck, Truck, Clock, ChevronRight, Monitor } from "lucide-react";
import { motion } from "motion/react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

interface Product {
  id: number;
  title: string;
  category: string;
  price: string;
  img: string;
  video_url?: string;
  description: string;
  specs?: any;
  tiers?: any;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(t('product.tab.details'));

  useEffect(() => {
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: Product) => p.id === Number(id));
        if (found) {
          setProduct(found);
        } else {
          navigate("/products");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pt-40 pb-40 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yunxi-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {});
  const tiers = typeof product.tiers === 'string' ? JSON.parse(product.tiers) : (product.tiers || []);

  const tabs = [
    { id: 'details', label: t('product.tab.details') },
    { id: 'specs', label: t('product.tab.specs') },
    { id: 'process', label: t('product.tab.process') }
  ];

  return (
    <main className="pt-32 pb-32">
      <SEO 
        title={`${product.title} - ${t('nav.products')}`}
        description={product.description}
        image={product.img}
        type="product"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-yunxi-dark/40 mb-12">
          <Link to="/" className="hover:text-yunxi-red transition-colors">{t('nav.home')}</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-yunxi-red transition-colors">{t('nav.products')}</Link>
          <ChevronRight size={12} />
          <span className="text-yunxi-dark">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[40px] overflow-hidden bg-yunxi-gray relative group"
            >
              {product.video_url ? (
                <video 
                  src={product.video_url} 
                  controls 
                  className="w-full h-full object-cover"
                  poster={product.img}
                />
              ) : (
                <img 
                  src={product.img} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-yunxi-gray cursor-pointer ring-2 ring-yunxi-red transition-all">
                <img 
                  src={product.img} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {product.video_url && (
                <div className="aspect-square rounded-2xl overflow-hidden bg-yunxi-gray cursor-pointer flex items-center justify-center border-2 border-dashed border-yunxi-dark/10">
                  <Monitor size={24} className="text-yunxi-dark/40" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-10">
              <span className="px-4 py-2 bg-yunxi-red/10 text-yunxi-red text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-yunxi-dark tracking-tighter leading-tight mb-6">
                {product.title}
              </h1>
              <div className="flex items-center gap-6 mb-8">
                <span className="text-4xl font-black text-yunxi-red">{product.price}</span>
                <span className="text-sm font-bold text-yunxi-dark/30 line-through">{t('product.retailPrice')}: ¥12.00</span>
                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-md">{t('product.factoryDirect')}</span>
              </div>
              <p className="text-lg text-yunxi-dark/60 font-medium leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Wholesale Tiers */}
            {tiers.length > 0 && (
              <div className="mb-12 p-8 bg-yunxi-gray rounded-3xl">
                <h4 className="text-sm font-black text-yunxi-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Truck size={16} className="text-yunxi-red" />
                  {t('product.wholesaleTiers')}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {tiers.map((tier: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-2xl text-center border border-yunxi-dark/5">
                      <p className="text-xs font-bold text-yunxi-dark/40 mb-1">{tier.range}</p>
                      <p className="text-xl font-black text-yunxi-red">{tier.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-12">
              <button className="flex-1 bg-yunxi-red text-white py-6 rounded-2xl font-black text-lg hover:bg-yunxi-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-yunxi-red/20">
                <MessageSquare size={20} />
                {t('product.inquiryCta')}
              </button>
              <button className="flex-1 border-2 border-yunxi-dark text-yunxi-dark py-6 rounded-2xl font-black text-lg hover:bg-yunxi-dark hover:text-white transition-all flex items-center justify-center gap-3">
                <Clock size={20} />
                {t('product.sampleCta')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-yunxi-dark/5">
              {[
                { icon: ShieldCheck, label: t('product.quality'), sub: "Quality Assured" },
                { icon: Truck, label: t('product.shipping'), sub: "Global Shipping" },
                { icon: Clock, label: t('product.sampling'), sub: "Fast Sampling" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <item.icon size={24} className="text-yunxi-red mb-3" />
                  <p className="text-sm font-black text-yunxi-dark">{item.label}</p>
                  <p className="text-[10px] font-bold text-yunxi-dark/30 uppercase tracking-widest">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-32">
          <div className="flex gap-12 border-b border-yunxi-dark/10 mb-12">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.label)}
                className={`pb-6 text-xl font-black transition-all relative ${activeTab === tab.label ? "text-yunxi-red" : "text-yunxi-dark/30 hover:text-yunxi-dark"}`}
              >
                {tab.label}
                {activeTab === tab.label && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-yunxi-red" />}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === t('product.tab.details') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-xl max-w-none text-yunxi-dark/70">
                <p className="mb-10 text-2xl font-medium leading-relaxed">
                  {t('product.detail.desc').replace('{title}', product.title)}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <img src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800" className="rounded-3xl w-full" alt="Detail 1" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1586075010633-2444167ff83f?auto=format&fit=crop&q=80&w=800" className="rounded-3xl w-full" alt="Detail 2" referrerPolicy="no-referrer" />
                </div>
              </motion.div>
            )}

            {activeTab === t('product.tab.specs') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(specs).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-6 bg-yunxi-gray rounded-2xl">
                    <span className="font-bold text-yunxi-dark/40 uppercase tracking-widest text-xs">{key}</span>
                    <span className="font-black text-yunxi-dark">{value}</span>
                  </div>
                ))}
                {Object.keys(specs).length === 0 && (
                  <div className="col-span-2 py-20 text-center bg-yunxi-gray rounded-3xl">
                    <p className="text-yunxi-dark/40 font-bold">{t('product.noSpecs')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === t('product.tab.process') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { step: "01", title: t('product.process.step1.title'), desc: t('product.process.step1.desc') },
                  { step: "02", title: t('product.process.step2.title'), desc: t('product.process.step2.desc') },
                  { step: "03", title: t('product.process.step3.title'), desc: t('product.process.step3.desc') },
                  { step: "04", title: t('product.process.step4.title'), desc: t('product.process.step4.desc') }
                ].map((item, i) => (
                  <div key={i} className="relative p-10 bg-yunxi-dark rounded-3xl text-white group hover:bg-yunxi-red transition-colors">
                    <span className="text-6xl font-black opacity-10 absolute top-6 right-6 group-hover:opacity-20 transition-opacity">{item.step}</span>
                    <h4 className="text-2xl font-black mb-4 relative z-10">{item.title}</h4>
                    <p className="text-white/60 font-medium leading-relaxed relative z-10">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
