"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <h1 className="text-xl font-bold">{t('dashboard')}</h1>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;