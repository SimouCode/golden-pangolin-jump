"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';
import { useIncome } from '@/contexts/IncomeContext'; // Import useIncome
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const FinancialSummaryCard = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { incomeEntries } = useIncome(); // Use incomeEntries

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncomeTransactions = transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        t.date.getMonth() === currentMonth &&
        t.date.getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyOtherIncome = incomeEntries
    .filter(
      (i) =>
        i.date.getMonth() === currentMonth &&
        i.date.getFullYear() === currentYear
    )
    .reduce((sum, i) => sum + i.amount, 0);

  const totalMonthlyIncome = monthlyIncomeTransactions + monthlyOtherIncome;

  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date.getMonth() === currentMonth &&
        t.date.getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalMonthlyIncome - monthlyExpenses;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('financial_summary')}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {t('net_savings')}:{' '}
          <span className={cn(netSavings >= 0 ? 'text-green-600' : 'text-red-600')}>
            {formatCurrency(netSavings, t('currency_locale'))}
          </span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            {t('total_income')}: {formatCurrency(totalMonthlyIncome, t('currency_locale'))}
          </div>
          <div className="flex items-center">
            <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
            {t('total_expenses')}: {formatCurrency(monthlyExpenses, t('currency_locale'))}
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