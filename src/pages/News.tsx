import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

interface NewsItem {
  id: number;
  title: string;
  title_en: string;
  excerpt: string;
  excerpt_en: string;
  date: string;
  category: string;
  img: string;
}

export default function News() {
  const { t, language } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        setNewsItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching news:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="pt-32 pb-32">
      <SEO 
        title={t('news.seo.title')}
        description={t('news.seo.desc')}
        keywords="云浠包装新闻, 包装行业趋势, 印刷技术资讯, 温州包装厂动态"
      />

      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">News & Insights</span>
          <h1 className="text-5xl md:text-8xl font-black text-yunxi-dark tracking-tighter leading-[0.9] mb-8">
            {t('news.hero.title').split(' ').slice(0, -1).join(' ')} <br />
            <span className="text-yunxi-red">{t('news.hero.title').split(' ').slice(-1)}</span>
          </h1>
          <p className="text-xl text-yunxi-dark/50 font-medium max-w-3xl">
            {t('news.hero.desc')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-yunxi-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {newsItems.map((item, index) => (
              <motion.article 
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-8 bg-yunxi-gray">
                  <img 
                    src={item.img} 
                    alt={language === 'zh' ? item.title : item.title_en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-yunxi-dark uppercase tracking-widest shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-xs font-bold text-yunxi-dark/30 uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-yunxi-red" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-yunxi-red" />
                    <span>{t('news.author.center')}</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-yunxi-dark mb-4 group-hover:text-yunxi-red transition-colors leading-tight">
                  <Link to={`/news/${item.id}`}>
                    {language === 'zh' ? item.title : item.title_en}
                  </Link>
                </h2>
                
                <p className="text-yunxi-dark/50 font-medium leading-relaxed mb-8 line-clamp-3">
                  {language === 'zh' ? item.excerpt : item.excerpt_en}
                </p>
                
                <Link 
                  to={`/news/${item.id}`} 
                  className="mt-auto flex items-center gap-3 text-sm font-black text-yunxi-dark hover:text-yunxi-red transition-colors group/link"
                >
                  {t('news.readMore')}
                  <div className="w-10 h-10 rounded-full border border-yunxi-dark/10 flex items-center justify-center group-hover/link:bg-yunxi-red group-hover/link:border-yunxi-red group-hover/link:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-6 mt-40">
        <div className="bg-yunxi-dark rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8">{t('news.newsletter.title')}</h2>
            <p className="text-xl text-white/40 font-bold mb-12">
              {t('news.newsletter.desc')}
            </p>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t('news.newsletter.placeholder')}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold focus:outline-none focus:border-yunxi-red transition-all"
              />
              <button className="px-10 py-5 bg-yunxi-red text-white font-black rounded-2xl hover:bg-white hover:text-yunxi-dark transition-all shadow-xl shadow-yunxi-red/20">
                {t('news.newsletter.btn')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
