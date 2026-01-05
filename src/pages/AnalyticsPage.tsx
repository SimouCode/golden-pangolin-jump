"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import MonthlySummaryChart from '@/components/MonthlySummaryChart';
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCategories } from '@/hooks/use-categories'; // Import useCategories
import { format } from 'date-fns';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  // Map category_id to category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : t('unknown_category');
  };

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
      const categoryName = getCategoryName(transaction.category_id);
      acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
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

        <div className="grid gap-6 md:grid-cols-2">
          <MonthlySummaryChart data={monthlySummaryData} />
          <SpendingCategoriesChart data={spendingCategoriesData} />
        </div>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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