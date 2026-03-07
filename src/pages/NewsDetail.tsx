import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2, ChevronRight, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

interface NewsItem {
  id: number;
  title: string;
  title_en: string;
  excerpt: string;
  excerpt_en: string;
  content?: string;
  content_en?: string;
  date: string;
  category: string;
  img: string;
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        const found = data.find((n: NewsItem) => n.id === Number(id));
        if (found) {
          setNews(found);
        } else {
          navigate("/news");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching news:", err);
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

  if (!news) return null;

  const displayTitle = language === 'zh' ? news.title : news.title_en;
  const displayContent = language === 'zh' ? (news.content || news.excerpt) : (news.content_en || news.excerpt_en);

  return (
    <main className="pt-32 pb-32">
      <SEO 
        title={`${displayTitle} - ${t('nav.news')}`}
        description={language === 'zh' ? news.excerpt : news.excerpt_en}
        image={news.img}
        type="article"
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-yunxi-dark/40 mb-12">
          <Link to="/" className="hover:text-yunxi-red transition-colors">{t('nav.home')}</Link>
          <ChevronRight size={12} />
          <Link to="/news" className="hover:text-yunxi-red transition-colors">{t('nav.news')}</Link>
          <ChevronRight size={12} />
          <span className="text-yunxi-dark truncate max-w-[200px]">{displayTitle}</span>
        </nav>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <span className="px-4 py-2 bg-yunxi-red/10 text-yunxi-red text-[10px] font-black uppercase tracking-widest rounded-full">
                {news.category}
              </span>
              <div className="flex items-center gap-6 text-xs font-bold text-yunxi-dark/30 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-yunxi-red" />
                  <span>{news.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-yunxi-red" />
                  <span>{t('news.author.center')}</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-yunxi-dark tracking-tighter leading-tight mb-8">
              {displayTitle}
            </h1>

            <div className="aspect-[21/9] rounded-[40px] overflow-hidden bg-yunxi-gray mb-12">
              <img 
                src={news.img} 
                alt={displayTitle}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </header>

          <div className="prose prose-xl max-w-none text-yunxi-dark/70 leading-relaxed font-medium">
            {displayContent.split('\n').map((para, i) => (
              <p key={i} className="mb-8">{para}</p>
            ))}
          </div>

          <footer className="mt-20 pt-10 border-t border-yunxi-dark/5 flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-yunxi-gray rounded-full text-sm font-black text-yunxi-dark hover:bg-yunxi-red hover:text-white transition-all">
                <Share2 size={16} />
                {t('common.share')}
              </button>
            </div>
            
            <Link to="/news" className="flex items-center gap-2 text-sm font-black text-yunxi-red hover:underline underline-offset-8">
              <ArrowLeft size={16} />
              {t('news.backToList')}
            </Link>
          </footer>
        </article>

        {/* Related Inquiry CTA */}
        <div className="mt-32 p-12 bg-yunxi-dark rounded-[40px] text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-6">{t('news.cta.title') || "Need Professional Packaging Solutions?"}</h3>
            <p className="text-white/40 font-bold mb-10 max-w-xl mx-auto">
              {t('news.cta.desc') || "Contact our experts today for a free consultation and custom quote."}
            </p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-yunxi-red text-white font-black rounded-2xl hover:bg-white hover:text-yunxi-dark transition-all shadow-xl shadow-yunxi-red/20">
              <MessageSquare size={20} />
              {t('common.inquiry')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
