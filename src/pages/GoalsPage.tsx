"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';

const GoalsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('goals')}</h2>
        <p className="text-muted-foreground">{t('goals_page_description')}</p>

        {/* Placeholder for goals list */}
        <div className="border rounded-lg p-4 text-center text-muted-foreground h-48 flex items-center justify-center">
          {t('no_goals_yet')}
        </div>
      </div>
    </Layout>
  );
};

export default GoalsPage;