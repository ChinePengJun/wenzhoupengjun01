import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const { t, language } = useLanguage();
  const { settings } = useSettings();

  return (
    <footer className="bg-yunxi-dark text-white pt-32 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-yunxi-red rounded-xl flex items-center justify-center text-white font-black text-2xl italic">YX</div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none">YUNXI PACKAGING</span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">{language === 'zh' ? settings.companyName : settings.companyNameEn}</span>
              </div>
            </div>
            <p className="text-white/60 text-lg leading-relaxed max-w-md mb-12">
              {t('footer.about')}
            </p>
            <div className="flex gap-4">
              {[Facebook, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-yunxi-red hover:border-yunxi-red transition-all group">
                  <Icon size={20} className="text-white group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-widest uppercase mb-10 text-white/40">{t('footer.links')}</h4>
            <ul className="space-y-6">
              {[
                { label: t('nav.products'), path: "/products" },
                { label: t('nav.about'), path: "/about" },
                { label: t('nav.news'), path: "/news" },
                { label: t('nav.contact'), path: "/contact" },
                { label: t('footer.admin'), path: "/admin" }
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-lg font-bold hover:text-yunxi-red transition-colors flex items-center gap-2 group">
                    {link.label}
                    <ArrowUpRight size={16} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-widest uppercase mb-10 text-white/40">{t('footer.contact')}</h4>
            <ul className="space-y-8">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-yunxi-red" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{t('footer.phone')}</p>
                  <p className="text-lg font-bold">{settings.phone}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-yunxi-red" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{t('contact.form.email.label')}</p>
                  <p className="text-lg font-bold">{settings.email}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-yunxi-red" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{t('contact.info.address.label')}</p>
                  <p className="text-lg font-bold leading-snug">{settings.address}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-sm font-bold tracking-widest uppercase">
            {t('footer.rights')}
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-xs font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="text-xs font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors">{t('footer.terms')}</a>
            <a href="#" className="text-xs font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors">浙ICP备12345678号</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
