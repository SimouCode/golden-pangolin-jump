"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import MonthlySummaryChart from '@/components/MonthlySummaryChart';
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsPage = () => {
  const { t } = useTranslation();

  // Dummy data for analytics charts
  const monthlySummaryData = [
    { name: t('january'), income: 3000, expenses: 1500 },
    { name: t('february'), income: 3200, expenses: 1800 },
    { name: t('march'), income: 2800, expenses: 1400 },
    { name: t('april'), income: 3500, expenses: 2000 },
    { name: t('may'), income: 3100, expenses: 1600 },
    { name: t('june'), income: 3300, expenses: 1900 },
  ];

  const spendingCategoriesData = [
    { name: t('food'), value: 800 },
    { name: t('transport'), value: 450 },
    { name: t('entertainment'), value: 300 },
    { name: t('utilities'), value: 250 },
    { name: t('rent'), value: 1200 },
    { name: t('shopping'), value: 600 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('analytics')}</h2>
        <p className="text-muted-foreground">{t('analytics_page_description')}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <MonthlySummaryChart data={monthlySummaryData} />
          <SpendingCategoriesChart data={spendingCategoriesData} />
        </div>

        {/* Placeholder for additional analytics insights */}
        <Card>
          <CardHeader>
            <CardTitle>{t('additional_insights')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('additional_insights_placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;