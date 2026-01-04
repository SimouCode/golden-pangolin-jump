"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import MonthlySummaryChart from '@/components/MonthlySummaryChart';
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';
import { format } from 'date-fns';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();

  // Calculate Monthly Summary Data
  const monthlySummaryMap = transactions.reduce((acc, transaction) => {
    const monthYear = format(transaction.date, 'MMM yyyy');
    if (!acc[monthYear]) {
      acc[monthYear] = { name: monthYear, income: 0, expenses: 0 };
    }
    if (transaction.type === 'income') {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expenses += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { name: string; income: number; expenses: number }>);

  const monthlySummaryData = Object.values(monthlySummaryMap).sort((a, b) => {
    // Sort by date for chronological order
    const dateA = new Date(a.name);
    const dateB = new Date(b.name);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate Spending Categories Data
  const spendingCategoriesMap = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const spendingCategoriesData = Object.entries(spendingCategoriesMap).map(([name, value]) => ({
    name,
    value,
  }));

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