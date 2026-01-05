"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useSession } from '@/contexts/SessionContext'; // Import useSession
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { session, supabase } = useSession();

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
      case '/settings':
        return t('settings');
      case '/login':
        return t('welcome');
      default:
        return t('dashboard'); // Fallback
    }
  };

  const currentPageTitle = getPageTitle(location.pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Page title visible only on small screens */}
        <h1 className="text-xl font-bold md:hidden">{currentPageTitle}</h1>
        {/* Utility items always visible, aligned to end on medium and larger screens */}
        <div className="flex items-center space-x-4 md:ml-auto">
          <LanguageSwitcher />
          <ThemeToggle />
          {session && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="md:hidden">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">{t('logout')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;