"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Repeat, BarChart, Target, Settings, Wallet, TrendingUp } from 'lucide-react'; // Import TrendingUp icon for Income
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t('dashboard'), icon: Home, path: '/' },
    { name: t('transactions'), icon: Repeat, path: '/transactions' },
    { name: t('income_tracking'), icon: TrendingUp, path: '/income' }, // Added Income link
    { name: t('analytics'), icon: BarChart, path: '/analytics' },
    { name: t('goals'), icon: Target, path: '/goals' },
    { name: t('budgets'), icon: Wallet, path: '/budgets' },
    { name: t('settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground p-4 sticky top-0 h-screen">
      <div className="flex items-center h-16 px-4">
        <h2 className="text-2xl font-bold text-sidebar-primary">{t('dashboard')}</h2>
      </div>
      <nav className="flex-1 mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Link to={item.path} className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;