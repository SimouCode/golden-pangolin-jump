"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Map paths to their respective titles
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return t('dashboard');
      case '/transactions':
        return t('transactions');
      case '/transactions/add':
        return t('add_transaction');
      case '/analytics':
        return t('analytics');
      case '/goals':
        return t('goals');
      case '/budgets':
        return t('budgets');
      case '/income': // New case for IncomePage
        return t('income_tracking');
      case '/settings':
        return t('settings');
      default:
        return t('dashboard'); // Fallback
    }
  };

  const currentPageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Page title visible only on small screens */}
        <h1 className="text-xl font-bold md:hidden">{currentPageTitle}</h1>
        {/* Utility items always visible, aligned to end on medium and larger screens */}
        <div className="flex items-center space-x-4 md:ml-auto">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;