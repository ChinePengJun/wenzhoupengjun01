import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: t('nav.home') },
    { path: "/products", label: t('nav.products') },
    { path: "/about", label: t('nav.about') },
    { path: "/news", label: t('nav.news') },
    { path: "/contact", label: t('nav.contact') }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "glass-nav py-3" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-yunxi-red rounded-lg flex items-center justify-center text-white font-black text-xl italic transition-transform group-hover:scale-110">YX</div>
            <div className="flex flex-col">
              <span className={`font-black text-xl tracking-tighter leading-none ${isScrolled ? "text-yunxi-dark" : "text-white"}`}>YUNXI PACKAGING</span>
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isScrolled ? "text-yunxi-red" : "text-white/60"}`}>{language === 'zh' ? settings.companyName : settings.companyNameEn}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`text-sm font-bold uppercase tracking-widest transition-all relative group ${isScrolled ? "text-yunxi-dark/70 hover:text-yunxi-red" : "text-white/80 hover:text-white"}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-yunxi-red transition-all group-hover:w-full ${location.pathname === item.path ? "w-full" : ""}`}></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 ${isScrolled ? "text-yunxi-dark" : "text-white"}`}
            >
              <Globe size={18} className="text-yunxi-red" />
              <span>{language === 'zh' ? 'EN' : '中文'}</span>
            </button>
            <button className={`p-2 rounded-full transition-colors ${isScrolled ? "text-yunxi-dark hover:bg-black/5" : "text-white hover:bg-white/10"}`}>
              <Search size={20} />
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} className={isScrolled ? "text-yunxi-dark" : "text-white"} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[100] bg-yunxi-dark text-white p-10 flex flex-col"
          >
            <div className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yunxi-red rounded-lg flex items-center justify-center text-white font-black text-xl italic">YX</div>
                <span className="font-black text-xl tracking-tighter">YUNXI</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-black text-left hover:text-yunxi-red transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-20 border-t border-white/5">
              <p className="text-white/40 text-xs font-bold tracking-widest mb-4 uppercase">{language === 'zh' ? '联系我们' : 'Get in touch'}</p>
              <p className="text-xl font-black mb-2">{settings.phone}</p>
              <p className="text-xl font-black">{settings.email}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
