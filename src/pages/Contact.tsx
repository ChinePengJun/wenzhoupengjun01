import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from "lucide-react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormStatus("success");
        setFormData({ name: "", phone: "", email: "", content: "" });
      } else {
        throw new Error("Failed to send inquiry");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      setFormStatus("idle");
      alert("发送失败，请稍后再试。");
    }
  };

  return (
    <main className="pt-32 pb-32">
      <SEO 
        title={t('contact.seo.title')}
        description={t('contact.seo.desc')}
        keywords="联系云浠包装, 包装定制咨询, 滴胶贴纸报价, 温州包装厂地址"
      />

      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-yunxi-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Contact Us</span>
            <h1 className="text-5xl md:text-8xl font-black text-yunxi-dark tracking-tighter leading-[0.9] mb-10">
              {t('contact.hero.title').split(' ').slice(0, -1).join(' ')} <br />
              <span className="text-yunxi-red">{t('contact.hero.title').split(' ').slice(-1)}</span>
            </h1>
            <p className="text-xl text-yunxi-dark/60 font-medium leading-relaxed mb-12">
              {t('contact.hero.desc')}
            </p>

            <div className="space-y-10">
              {[
                { icon: Phone, label: t('contact.info.phone.label'), value: "+86 123 4567 8900", sub: t('contact.info.phone.sub') },
                { icon: Mail, label: t('contact.info.email.label'), value: "sales@cysticker.com", sub: t('contact.info.email.sub') },
                { icon: MapPin, label: t('contact.info.address.label'), value: t('footer.address'), sub: t('contact.info.address.sub') }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-yunxi-gray flex items-center justify-center shrink-0 group-hover:bg-yunxi-red transition-colors">
                    <item.icon size={28} className="text-yunxi-red group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-yunxi-dark/30 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-yunxi-dark mb-1">{item.value}</p>
                    <p className="text-sm font-bold text-yunxi-dark/40">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yunxi-dark rounded-[40px] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yunxi-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            {formStatus === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-yunxi-red rounded-full flex items-center justify-center text-white mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">{t('contact.form.success.title')}</h3>
                <p className="text-white/60 text-lg mb-10">{t('contact.form.success.desc')}</p>
                <button 
                  onClick={() => setFormStatus("idle")}
                  className="px-10 py-4 bg-white text-yunxi-dark font-black rounded-full hover:bg-yunxi-red hover:text-white transition-all"
                >
                  {t('contact.form.success.btn')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-4">{t('contact.form.name.label')}</label>
                    <input 
                      required
                      type="text" 
                      placeholder={t('contact.form.name.placeholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-yunxi-red transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-4">{t('contact.form.phone.label')}</label>
                    <input 
                      required
                      type="tel" 
                      placeholder={t('contact.form.phone.placeholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-yunxi-red transition-all"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-4">{t('contact.form.email.label')}</label>
                  <input 
                    required
                    type="email" 
                    placeholder={t('contact.form.email.placeholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-yunxi-red transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-4">{t('contact.form.content.label')}</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder={t('contact.form.content.placeholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-yunxi-red transition-all resize-none"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  disabled={formStatus === "submitting"}
                  className="w-full py-6 bg-yunxi-red text-white font-black text-xl rounded-2xl hover:bg-white hover:text-yunxi-dark transition-all flex items-center justify-center gap-3 shadow-2xl shadow-yunxi-red/20 disabled:opacity-50"
                >
                  {formStatus === "submitting" ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={20} />
                      {t('contact.form.submit')}
                    </>
                  )}
                </button>
                <p className="text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                  {t('contact.form.privacy')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="aspect-[21/9] rounded-[40px] overflow-hidden bg-yunxi-gray relative group">
          <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
            alt="Map Placeholder"
            className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-10 bg-white rounded-3xl shadow-2xl text-center max-w-sm">
              <MapPin size={48} className="text-yunxi-red mx-auto mb-6" />
              <h4 className="text-2xl font-black text-yunxi-dark mb-2">{t('nav.home') === '首页' ? '温州云浠包装有限公司' : 'Wenzhou Yunxi Packaging Co., Ltd.'}</h4>
              <p className="text-yunxi-dark/40 font-bold mb-6">{t('footer.address')}</p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-yunxi-red font-black hover:underline"
              >
                {t('contact.map.view')}
                <Send size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
