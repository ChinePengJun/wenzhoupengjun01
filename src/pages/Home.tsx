import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Star, Shield, Zap, Award, CheckCircle2 } from "lucide-react";
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.filter((p: Product) => p.isFeatured === 1));
        setLoading(false);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const stats = [
    { value: "10+", label: t('stats.experience'), sub: "Years Experience" },
    { value: "5000+", label: t('home.stats.factory'), sub: "Factory Size (㎡)" },
    { value: "100W+", label: t('home.stats.capacity'), sub: "Daily Capacity" },
    { value: "2000+", label: t('stats.clients'), sub: "Global Clients" }
  ];

  const categories = [
    { 
      id: "stickers", 
      title: t('cat.epoxy'), 
      en: "Epoxy Stickers",
      desc: language === 'zh' ? "高透明度、耐黄变、立体感强，适用于电子产品、礼品装饰。" : "High transparency, non-yellowing, strong 3D effect, suitable for electronics and gifts.",
      image: "https://images.unsplash.com/photo-1572375927902-d623603d1977?auto=format&fit=crop&q=80&w=800",
      tags: language === 'zh' ? ["高透明", "耐磨损", "强粘性"] : ["Clear", "Durable", "Strong Adhesion"]
    },
    { 
      id: "labels", 
      title: t('cat.labels'), 
      en: "Industrial Labels",
      desc: language === 'zh' ? "耐高温、耐腐蚀、防水防油，广泛应用于机械、化工、物流。" : "Heat-resistant, corrosion-resistant, waterproof, widely used in machinery and logistics.",
      image: "https://images.unsplash.com/photo-1626863905121-3b0c0ed7b94c?auto=format&fit=crop&q=80&w=800",
      tags: language === 'zh' ? ["耐候性", "多材质", "可定制"] : ["Weatherproof", "Multi-material", "Custom"]
    },
    { 
      id: "packaging", 
      title: t('cat.boxes'), 
      en: "Custom Packaging",
      desc: language === 'zh' ? "精美印刷、结构稳固，提升品牌价值，适用于化妆品、食品、奢侈品。" : "Exquisite printing, stable structure, enhances brand value, suitable for luxury and food.",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800",
      tags: language === 'zh' ? ["环保材质", "精细印刷", "结构创新"] : ["Eco-friendly", "Fine Print", "Innovative"]
    }
  ];

  return (
    <main>
      <SEO 
        title={language === 'zh' ? "温州云浠包装有限公司 - 专业3D滴胶贴纸、不干胶标签生产批发厂商" : "Wenzhou Yunxi Packaging - 3D Epoxy Stickers & Custom Labels Manufacturer"}
        description={language === 'zh' ? "温州云浠包装有限公司专业生产批发3D滴胶贴纸、不干胶标签、纸袋及各类定制包装。拥有10年行业经验，提供一站式高品质印刷包装解决方案。" : "Wenzhou Yunxi Packaging specializes in 3D epoxy stickers, custom labels, and packaging solutions with 10 years of experience."}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-yunxi-dark">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover opacity-40 scale-105"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-industrial-factory-machinery-in-action-42353-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-[1px] bg-yunxi-red"></span>
              <span className="text-yunxi-red font-black tracking-[0.4em] uppercase text-sm">{t('home.hero.badge')}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10 text-balance">
              {t('home.hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">{t('home.hero.title2')}</span>
            </h1>
            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl mb-12 text-balance">
              {t('hero.subtitle')}。{language === 'zh' ? '我们以精湛的工艺与创新的技术，为全球品牌提供从设计到生产的一站式定制化包装解决方案。' : 'We provide one-stop custom packaging solutions from design to production for global brands with exquisite craftsmanship and innovative technology.'}
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/products" className="px-10 py-5 bg-yunxi-red text-white font-black rounded-full hover:bg-white hover:text-yunxi-dark transition-all flex items-center gap-3 group">
                {t('hero.cta')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-10 py-5 border border-white/20 text-white font-black rounded-full hover:bg-white/10 transition-all flex items-center gap-3">
                <Play size={20} fill="currentColor" />
                {t('home.hero.video')}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
          <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-white"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-6xl md:text-7xl font-black text-yunxi-dark tracking-tighter mb-4">{stat.value}</span>
                <span className="text-lg font-black text-yunxi-red mb-1">{stat.label}</span>
                <span className="text-[10px] font-bold text-yunxi-dark/30 uppercase tracking-widest">{stat.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-yunxi-gray py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="max-w-2xl">
              <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Our Expertise</span>
              <h2 className="text-5xl md:text-6xl font-black text-yunxi-dark tracking-tighter leading-tight">
                {t('home.cats.title')}
              </h2>
            </div>
            <Link to="/products" className="group flex items-center gap-3 text-lg font-black text-yunxi-dark hover:text-yunxi-red transition-colors">
              {t('home.cats.all')}
              <div className="w-12 h-12 rounded-full border border-yunxi-dark/10 flex items-center justify-center group-hover:border-yunxi-red group-hover:bg-yunxi-red group-hover:text-white transition-all">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative h-[600px] rounded-3xl overflow-hidden cursor-pointer"
              >
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yunxi-dark via-yunxi-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex gap-2 mb-6">
                    {cat.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-yunxi-red font-black tracking-[0.2em] uppercase text-xs mb-2">{cat.en}</span>
                  <h3 className="text-4xl font-black text-white mb-4">{cat.title}</h3>
                  <p className="text-white/60 font-medium leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                    {cat.desc}
                  </p>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-yunxi-dark transition-all group-hover:w-full group-hover:rounded-xl font-black overflow-hidden whitespace-nowrap">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">{t('common.inquiry')}</span>
                    <ArrowRight size={20} className="group-hover:ml-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Featured Products</span>
            <h2 className="text-5xl md:text-6xl font-black text-yunxi-dark tracking-tighter mb-6">{t('featured.title')}</h2>
            <p className="text-lg text-yunxi-dark/50 font-medium">{t('featured.subtitle')}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-yunxi-gray rounded-3xl mb-6"></div>
                  <div className="h-6 bg-yunxi-gray rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-yunxi-gray rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.map((product, i) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <Link to={`/products/${product.id}`} className="block relative aspect-square rounded-3xl overflow-hidden bg-yunxi-gray mb-6">
                    <img 
                      src={product.img} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black text-yunxi-dark uppercase tracking-widest rounded-full shadow-sm">
                        {language === 'zh' ? product.category : (product.category === '3D 滴胶贴纸' ? t('cat.epoxy') : product.category === '不干胶标签' ? t('cat.labels') : product.category === '定制包装盒' ? t('cat.boxes') : t('cat.bags'))}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-yunxi-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-yunxi-dark scale-50 group-hover:scale-100 transition-transform duration-500">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </Link>
                  <h3 className="text-2xl font-black text-yunxi-dark mb-2 group-hover:text-yunxi-red transition-colors">{product.title}</h3>
                  <p className="text-yunxi-dark/40 font-bold mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-yunxi-dark/5">
                    <span className="text-xl font-black text-yunxi-red">{product.price}</span>
                    <button className="text-sm font-black text-yunxi-dark hover:underline underline-offset-8">{t('common.inquiry')}</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us / Factory */}
      <section className="bg-yunxi-dark py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <path d="M0 0 L100 0 L100 100 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Manufacturing Excellence</span>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-10">
                {t('home.factory.title1')} <br />
                <span className="text-white/40">{t('home.factory.title2')}</span>
              </h2>
              
              <div className="space-y-10">
                {[
                  { 
                    icon: Shield, 
                    title: language === 'zh' ? "ISO9001 认证体系" : "ISO9001 Certification", 
                    desc: language === 'zh' ? "严格执行国际质量管理体系，确保每一件产品都符合最高标准。" : "Strictly implement international quality management systems to ensure every product meets the highest standards." 
                  },
                  { 
                    icon: Zap, 
                    title: language === 'zh' ? "高效自动化生产" : "High Efficiency Automation", 
                    desc: language === 'zh' ? "引进德国海德堡印刷机及全自动滴胶设备，实现高精度、高效率生产。" : "Introduce German Heidelberg printing presses and automatic epoxy equipment for high precision and efficiency." 
                  },
                  { 
                    icon: Award, 
                    title: language === 'zh' ? "环保原材料" : "Eco-friendly Materials", 
                    desc: language === 'zh' ? "选用符合 SGS/RoHS 标准的环保油墨与胶水，安全无毒，助力绿色包装。" : "Select eco-friendly inks and glues that meet SGS/RoHS standards, safe and non-toxic." 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-yunxi-red transition-colors">
                      <item.icon size={28} className="text-yunxi-red group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">{item.title}</h4>
                      <p className="text-white/40 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&q=80&w=1200" 
                  alt="Factory"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-yunxi-red/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-3xl shadow-2xl hidden md:block max-w-xs">
                <div className="flex items-center gap-2 text-yunxi-red mb-4">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-yunxi-dark font-bold text-lg leading-snug mb-6 italic">
                  {language === 'zh' ? '"云浠包装的滴胶贴纸质量非常稳定，透明度极高，是我们长期信赖的合作伙伴。"' : '"The quality of Yunxi Packaging\'s epoxy stickers is very stable, with extremely high transparency. They are our long-term trusted partner."'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yunxi-gray"></div>
                  <div>
                    <p className="font-black text-yunxi-dark">{language === 'zh' ? '张经理' : 'Mr. Zhang'}</p>
                    <p className="text-xs font-bold text-yunxi-dark/40 uppercase tracking-widest">{language === 'zh' ? '某知名电子品牌 采购总监' : 'Procurement Director, Electronics Brand'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-yunxi-red py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-10">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-white/80 font-bold mb-12 max-w-2xl mx-auto">
            {language === 'zh' ? '联系我们的专业团队，获取免费样品与最具竞争力的批发报价。' : 'Contact our professional team for free samples and the most competitive wholesale quotes.'}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/contact" className="px-12 py-6 bg-white text-yunxi-red font-black rounded-full hover:bg-yunxi-dark hover:text-white transition-all text-lg shadow-xl">
              {t('hero.contact')}
            </Link>
            <Link to="/products" className="px-12 py-6 border-2 border-white text-white font-black rounded-full hover:bg-white hover:text-yunxi-red transition-all text-lg">
              {t('home.cta.browse')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
