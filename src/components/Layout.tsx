"use client";

import React, { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar'; // Import Sidebar
import { MadeWithDyad } from './made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { direction } = useLanguage();

  return (
    <div dir={direction} className="min-h-screen flex"> {/* Changed to flex for sidebar layout */}
      <Sidebar /> {/* Render Sidebar */}
      <div className="flex flex-col flex-1"> {/* Main content area */}
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          {children}
        </main>
        <MadeWithDyad />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Layout;