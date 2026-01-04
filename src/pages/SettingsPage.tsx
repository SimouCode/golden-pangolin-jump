"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('settings')}</h2>
        <p className="text-muted-foreground">{t('settings_page_description')}</p>

        <div className="grid gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('language')}</h3>
            <LanguageSwitcher />
          </div>
          {/* Add more settings options here */}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;