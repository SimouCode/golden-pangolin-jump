"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, TrendingDown, Target, Wallet, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import MonthlySummaryChart from '@/components/MonthlySummaryChart';
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart';
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import SmartRecommendations from '@/components/SmartRecommendations';
import CategoryBudgetProgressCard from '@/components/CategoryBudgetProgressCard';
import { useTransactions } from '@/contexts/TransactionContext';
import { useGoals } from '@/contexts/GoalContext';
import { useCategories } from '@/hooks/use-categories'; // Import useCategories
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
import { cn, formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Component for Current Balance
const CurrentBalanceCard = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();

  const currentBalance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  }, [transactions]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('current_balance')}</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{formatCurrency(currentBalance, t('currency_locale'))}</div>
        <p className="text-xs text-muted-foreground mt-1">{t('balance_info')}</p>
      </CardContent>
    </Card>
  );
};

// Component for Goals Progress
const GoalsProgressCard = () => {
  const { t } = useTranslation();
  const { goals } = useGoals();

  const activeGoals = goals.filter(goal => goal.saved_amount < goal.target_amount);

  if (activeGoals.length === 0) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('savings_goals_progress')}</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('no_active_goals')}</p>
          <Button asChild variant="link" className="p-0 h-auto mt-2">
            <Link to="/goals">{t('set_new_goal')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('savings_goals_progress')}</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.slice(0, 3).map(goal => { // Show top 3 goals
          const progress = (goal.saved_amount / goal.target_amount) * 100;
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.name}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(goal.saved_amount, t('currency_locale'))} / {formatCurrency(goal.target_amount, t('currency_locale'))}
              </p>
            </div>
          );
        })}
        {activeGoals.length > 3 && (
          <Button asChild variant="link" className="p-0 h-auto">
            <Link to="/goals">{t('view_all_goals')}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};


const Index = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  // Calculate Monthly Summary Data for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalMonthlyIncome = transactions
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
    { name: t('current_month'), income: totalMonthlyIncome, expenses: monthlyExpenses },
  ];

  // Calculate Spending Categories Data
  const spendingCategoriesMap = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = categories.find(cat => cat.id === transaction.category_id)?.name || t('unknown_category');
      acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
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

  const getCategoryNameById = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : t('unknown_category');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight hidden md:block">{t('welcome')}</h2>
        <p className="text-muted-foreground hidden md:block">{t('description')}</p>

        {/* Smart Recommendations */}
        <SmartRecommendations />

        {/* Top Row Cards: Current Balance, Monthly Income, Monthly Expenses, Net Savings */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CurrentBalanceCard />
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_income')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalMonthlyIncome, t('currency_locale'))}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('summary_for_month', { month: format(new Date(), 'MMMM yyyy') })}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_expenses')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(monthlyExpenses, t('currency_locale'))}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('summary_for_month', { month: format(new Date(), 'MMMM yyyy') })}
              </p>
            </CardContent>
          </Card>
          <FinancialSummaryCard />
        </div>

        {/* Middle Row: Charts and Progress Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <MonthlySummaryChart data={monthlySummaryData} />
          <SpendingCategoriesChart data={spendingCategoriesData} />
          <CategoryBudgetProgressCard />
          <GoalsProgressCard />
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                        <TableCell>{getCategoryNameById(transaction.category_id)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {t(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount, t('currency_locale'))}
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
          <Button asChild size="lg" className="rounded-full md:rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
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