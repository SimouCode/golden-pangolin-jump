"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Repeat, BarChart, Target, Wallet, TrendingUp } from 'lucide-react'; // Import TrendingUp icon for Income
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navItems = [
    { name: t('dashboard'), icon: Home, path: '/' },
    { name: t('transactions'), icon: Repeat, path: '/transactions' },
    { name: t('income_tracking'), icon: TrendingUp, path: '/income' }, // Added Income link
    { name: t('analytics'), icon: BarChart, path: '/analytics' },
    { name: t('goals'), icon: Target, path: '/goals' },
    { name: t('budgets'), icon: Wallet, path: '/budgets' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-full w-full text-muted-foreground",
                isActive && "text-primary"
              )}
            >
              <Link to={item.path}>
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;