"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';

const AnalyticsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('analytics')}</h2>
        <p className="text-muted-foreground">{t('analytics_page_description')}</p>

        {/* Placeholder for charts/graphs */}
        <div className="border rounded-lg p-4 text-center text-muted-foreground h-48 flex items-center justify-center">
          {t('analytics_content_placeholder')}
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;