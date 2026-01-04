"use client";

import React, { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { MadeWithDyad } from './made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { direction } = useLanguage();

  return (
    <div dir={direction} className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4"> {/* Added pb-20 for mobile bottom nav */}
        {children}
      </main>
      <BottomNavigation />
      <MadeWithDyad />
    </div>
  );
};

export default Layout;