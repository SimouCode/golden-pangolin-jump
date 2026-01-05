"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const FinancialSummaryCard = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        t.date.getMonth() === currentMonth &&
        t.date.getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date.getMonth() === currentMonth &&
        t.date.getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = monthlyIncome - monthlyExpenses;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('financial_summary')}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4">
          {t('net_savings')}:{' '}
          <span className={cn(netSavings >= 0 ? 'text-green-600' : 'text-red-600')}>
            ${netSavings.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            {t('total_income')}: ${monthlyIncome.toFixed(2)}
          </div>
          <div className="flex items-center">
            <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
            {t('total_expenses')}: ${monthlyExpenses.toFixed(2)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('summary_for_month', { month: format(new Date(), 'MMMM yyyy') })}
        </p>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;