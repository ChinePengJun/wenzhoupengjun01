import { motion } from "motion/react";
import { Shield, Zap, Award, Users, Globe, Factory, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";

export default function About() {
  const { t, language } = useLanguage();
  const { settings } = useSettings();

  return (
    <main className="pt-32 pb-32">
      <SEO 
        title={t('about.seo.title')}
        description={t('about.seo.desc')}
        keywords="云浠包装简介, 温州包装厂历史, 滴胶贴纸厂家, 印刷包装工厂"
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-8xl font-black text-yunxi-dark tracking-tighter leading-[0.9] mb-10">
              {language === 'zh' 
                ? (typeof settings.aboutTitle === 'string' ? settings.aboutTitle : t('about.hero.title')) 
                : (typeof settings.aboutTitleEn === 'string' ? settings.aboutTitleEn : t('about.hero.title'))}
            </h1>
            <p className="text-xl text-yunxi-dark/60 font-medium leading-relaxed mb-8">
              {language === 'zh' 
                ? (typeof settings.aboutContent === 'string' ? settings.aboutContent : t('about.hero.desc1')) 
                : (typeof settings.aboutContentEn === 'string' ? settings.aboutContentEn : t('about.hero.desc1'))}
            </p>
            <p className="text-lg text-yunxi-dark/50 leading-relaxed">
              {t('about.hero.desc2')}
            </p>
          </motion.div>
          <div className="relative">
            <div className="aspect-square rounded-[60px] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
                alt="Company Office"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yunxi-red rounded-full flex flex-col items-center justify-center text-white p-10 text-center shadow-2xl">
              <span className="text-6xl font-black tracking-tighter mb-2">10+</span>
              <span className="text-sm font-bold uppercase tracking-widest">{t('about.stats.exp')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-yunxi-dark py-32 mb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="p-16 bg-white/5 rounded-[40px] border border-white/5">
              <h3 className="text-4xl font-black text-white mb-8">{t('about.mission.title')}</h3>
              <p className="text-xl text-white/60 leading-relaxed">
                {t('about.mission.desc')}
              </p>
            </div>
            <div className="p-16 bg-yunxi-red rounded-[40px]">
              <h3 className="text-4xl font-black text-white mb-8">{t('about.vision.title')}</h3>
              <p className="text-xl text-white/90 leading-relaxed">
                {t('about.vision.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Factory & Equipment */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Factory Power</span>
          <h2 className="text-5xl md:text-6xl font-black text-yunxi-dark tracking-tighter mb-6">{t('about.factory.title')}</h2>
          <p className="text-lg text-yunxi-dark/50 font-medium">{t('about.factory.desc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {[
            { title: t('about.equip.1.title'), desc: t('about.equip.1.desc'), image: "https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&q=80&w=800" },
            { title: t('about.equip.2.title'), desc: t('about.equip.2.desc'), image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800" },
            { title: t('about.equip.3.title'), desc: t('about.equip.3.desc'), image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800" }
          ].map((item, i) => (
            <div key={i} className="group rounded-3xl overflow-hidden bg-yunxi-gray">
              <div className="aspect-video overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black text-yunxi-dark mb-4">{item.title}</h4>
                <p className="text-yunxi-dark/60 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Shield, label: t('about.cert.iso'), sub: "Quality System" },
            { icon: Award, label: t('about.cert.sgs'), sub: "Eco-Friendly" },
            { icon: Factory, label: t('about.cert.factory'), sub: "Direct Factory" },
            { icon: Globe, label: t('about.cert.trade'), sub: "Global Trade" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-10 bg-yunxi-gray rounded-3xl">
              <item.icon size={40} className="text-yunxi-red mb-6" />
              <p className="text-xl font-black text-yunxi-dark mb-1">{item.label}</p>
              <p className="text-[10px] font-bold text-yunxi-dark/30 uppercase tracking-widest">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-yunxi-gray py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-black text-yunxi-dark tracking-tighter mb-20 text-center">{t('about.history.title')}</h2>
          <div className="space-y-20 relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-[1px] before:bg-yunxi-dark/10 before:hidden md:before:block">
            {[
              { year: "2014", title: t('about.history.1.title'), desc: t('about.history.1.desc') },
              { year: "2017", title: t('about.history.2.title'), desc: t('about.history.2.desc') },
              { year: "2020", title: t('about.history.3.title'), desc: t('about.history.3.desc') },
              { year: "2024", title: t('about.history.4.title'), desc: t('about.history.4.desc') }
            ].map((item, i) => (
              <div key={i} className={`flex flex-col md:flex-row gap-10 items-center ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1 text-center md:text-left">
                  <div className={`flex flex-col ${i % 2 === 0 ? "md:items-start" : "md:items-end"}`}>
                    <span className="text-6xl font-black text-yunxi-red mb-4">{item.year}</span>
                    <h4 className="text-2xl font-black text-yunxi-dark mb-4">{item.title}</h4>
                    <p className="text-lg text-yunxi-dark/50 font-medium max-w-md">{item.desc}</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-yunxi-red border-4 border-white shadow-xl relative z-10 hidden md:block"></div>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
