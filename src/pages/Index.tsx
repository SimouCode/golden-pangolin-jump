"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { t } = useTranslation();

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

        {/* Monthly Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('monthly_summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-lg font-semibold text-green-600">$2,500.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-lg font-semibold text-red-600">$1,265.44</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Spending Categories Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('top_spending_categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>Food</span>
                <span className="font-medium text-red-500">-$400.00</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Transport</span>
                <span className="font-medium text-red-500">-$250.00</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Entertainment</span>
                <span className="font-medium text-red-500">-$150.00</span>
              </li>
            </ul>
          </CardContent>
        </Card>

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