"use client";

import React, { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import { MadeWithDyad } from './made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { direction } = useLanguage();

  return (
    <div dir={direction} className="min-h-screen flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 pb-20 md:pb-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
        <MadeWithDyad />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Layout;