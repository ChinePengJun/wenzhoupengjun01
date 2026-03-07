import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSettings {
  companyName: string;
  companyNameEn: string;
  phone: string;
  email: string;
  address: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  aboutTitle?: string;
  aboutTitleEn?: string;
  aboutContent?: string;
  aboutContentEn?: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  companyName: "温州云浠包装有限公司",
  companyNameEn: "Wenzhou Yunxi Packaging Co., Ltd.",
  phone: "+86-123-4567-8900",
  email: "contact@yunxipack.com",
  address: "浙江省温州市龙港市印刷产业园 A 区 88 号",
  seoTitle: "温州云浠包装有限公司 - 专业3D滴胶贴纸、不干胶标签生产批发厂商",
  seoKeywords: "温州云浠包装, 3D滴胶贴纸, 不干胶标签, 包装定制, 印刷厂, 滴胶贴纸批发, 温州包装厂",
  seoDescription: "温州云浠包装有限公司专业生产批发3D滴胶贴纸、不干胶标签、纸袋及各类定制包装。拥有10年行业经验，提供一站式高品质印刷包装解决方案。",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSettings({ ...defaultSettings, ...data });
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
