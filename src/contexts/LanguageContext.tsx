"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/i18n'; // Ensure this path is correct

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(i18n.language);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(i18n.language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    const updateLanguage = (lng: string) => {
      setLanguageState(lng);
      setDirection(lng === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lng);
      document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
    };

    // Initialize language and direction on mount
    updateLanguage(i18n.language);

    // Listen for language changes from i18n
    i18n.on('languageChanged', updateLanguage);

    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, []);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};