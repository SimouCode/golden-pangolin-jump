"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MonthlySummaryChart from '@/components/MonthlySummaryChart'; // Import new chart
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart'; // Import new chart

const Index = () => {
  const { t } = useTranslation();

  // Dummy data for charts
  const monthlySummaryData = [
    { name: t('current_month'), income: 2500, expenses: 1265.44 },
  ];

  const spendingCategoriesData = [
    { name: t('food'), value: 400 },
    { name: t('transport'), value: 250 },
    { name: t('entertainment'), value: 150 },
    { name: t('utilities'), value: 100 },
    { name: t('rent'), value: 600 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight hidden md:block">{t('welcome')}</h2>
        <p className="text-muted-foreground hidden md:block">{t('description')}</p>

        {/* Current Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('current_balance')}</CardTitle>
            <span className="text-2xl font-bold">$1,234.56</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        {/* Monthly Summary Chart */}
        <MonthlySummaryChart data={monthlySummaryData} />

        {/* Top Spending Categories Chart */}
        <SpendingCategoriesChart data={spendingCategoriesData} />

        {/* Add New Transaction Button */}
        <div className="fixed bottom-20 right-4 md:static md:text-center">
          <Button asChild size="lg" className="rounded-full md:rounded-md shadow-lg">
            <Link to="/transactions/add">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('add_new_transaction')}
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;