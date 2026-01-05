"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

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

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('data_management')}</h3>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/settings/categories">
                <ListFilter className="mr-2 h-4 w-4" />
                {t('category_management')}
              </Link>
            </Button>
            {/* Add more data management options here */}
          </div>
          {/* Add more settings options here */}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;