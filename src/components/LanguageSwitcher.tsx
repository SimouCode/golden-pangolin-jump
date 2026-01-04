"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lng: string) => {
    setLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      <Select onValueChange={handleLanguageChange} value={language}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={i18n.t('language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{i18n.t('english')}</SelectItem>
          <SelectItem value="ar">{i18n.t('arabic')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;