"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MonthlySummaryChart from '@/components/MonthlySummaryChart';
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart';
import FinancialSummaryCard from '@/components/FinancialSummaryCard'; // Import new component
import { useTransactions } from '@/contexts/TransactionContext';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();

  // Calculate Current Balance
  const currentBalance = transactions.reduce((acc, transaction) => {
    return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
  }, 0);

  // Calculate Monthly Summary Data for the current month
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

  const monthlySummaryData = [
    { name: t('current_month'), income: monthlyIncome, expenses: monthlyExpenses },
  ];

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

  // Get recent transactions (e.g., last 5)
  const recentTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
    .slice(0, 5); // Take the top 5

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight hidden md:block">{t('welcome')}</h2>
        <p className="text-muted-foreground hidden md:block">{t('description')}</p>

        {/* Current Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('current_balance')}</CardTitle>
            <span className="text-2xl font-bold">${currentBalance.toFixed(2)}</span>
          </CardHeader>
          <CardContent>
            {/* Placeholder for percentage change, could be calculated with more historical data */}
            <p className="text-xs text-muted-foreground">{t('balance_info')}</p>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <FinancialSummaryCard />

        {/* Monthly Summary Chart */}
        <MonthlySummaryChart data={monthlySummaryData} />

        {/* Top Spending Categories Chart */}
        <SpendingCategoriesChart data={spendingCategoriesData} />

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recent_transactions')}</CardTitle>
            <Button variant="link" asChild className="p-0 h-auto">
              <Link to="/transactions">{t('view_all')}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('no_recent_transactions')}</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead className="text-right">{t('amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(transaction.date, 'MMM dd')}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {t(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.type === 'income' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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