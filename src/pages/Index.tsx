"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react'; // Added icons
import { Link } from 'react-router-dom';
import MonthlySummaryChart from '@/components/MonthlySummaryChart';
import SpendingCategoriesChart from '@/components/SpendingCategoriesChart';
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import SmartRecommendations from '@/components/SmartRecommendations';
import { useTransactions } from '@/contexts/TransactionContext';
import { useIncome } from '@/contexts/IncomeContext'; // Import useIncome
import { useBudgets } from '@/contexts/BudgetContext'; // Import useBudgets
import { useGoals } from '@/contexts/GoalContext'; // Import useGoals
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
import { Progress } from '@/components/ui/progress'; // Import Progress

// New component for Budget Overview
const BudgetOverviewCard = () => {
  const { t } = useTranslation();
  const { budgets } = useBudgets();
  const { transactions } = useTransactions();

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const monthlyBudgets = budgets.filter(b => b.monthYear === currentMonthYear);

  const totalBudgeted = monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = monthlyBudgets.reduce((sum, budget) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category.toLowerCase() === budget.category.toLowerCase() &&
          format(t.date, 'yyyy-MM') === budget.monthYear
      )
      .reduce((s, t) => s + t.amount, 0);
    return sum + spent;
  }, 0);

  const totalRemaining = totalBudgeted - totalSpent;
  const progress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const isOverBudget = totalSpent > totalBudgeted;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('monthly_budget_overview')}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {t('budgeted')}: {formatCurrency(totalBudgeted)}
        </div>
        <div className={cn("text-xl font-semibold mb-4", isOverBudget ? "text-destructive" : "text-foreground")}>
          {t('spent')}: {formatCurrency(totalSpent)}
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Progress value={progress} className={cn("w-full", isOverBudget && "bg-destructive")} />
          <span className={cn("text-sm font-medium", isOverBudget && "text-destructive")}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <p className={cn("text-sm", totalRemaining < 0 ? "text-destructive" : "text-green-600")}>
          {t('remaining')}: {formatCurrency(totalRemaining)}
        </p>
        {isOverBudget && (
          <p className="text-xs text-destructive mt-1">
            {t('over_budget_warning', { amount: formatCurrency(totalSpent - totalBudgeted, 'DZD', t('currency_locale')) })}
          </p>
        )}
        {monthlyBudgets.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">{t('no_budgets_for_current_month')}</p>
        )}
      </CardContent>
    </Card>
  );
};

// New component for Goals Progress
const GoalsProgressCard = () => {
  const { t } = useTranslation();
  const { goals } = useGoals();

  const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);

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
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.name}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
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
  const { incomeEntries } = useIncome(); // Use incomeEntries

  // Calculate Current Balance
  const totalIncome = useMemo(() => {
    const transactionIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const otherIncome = incomeEntries.reduce((sum, i) => sum + i.amount, 0);
    return transactionIncome + otherIncome;
  }, [transactions, incomeEntries]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const currentBalance = totalIncome - totalExpenses;

  // Calculate Monthly Summary Data for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactionIncome = transactions
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

  const totalMonthlyIncome = monthlyTransactionIncome + monthlyOtherIncome;

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

        {/* Smart Recommendations */}
        <SmartRecommendations />

        {/* Top Row Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Current Balance Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('current_balance')}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(currentBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('balance_info')}</p>
            </CardContent>
          </Card>

          {/* Monthly Income Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_income')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalMonthlyIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('summary_for_month', { month: format(new Date(), 'MMMM yyyy') })}
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expenses Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_expenses')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('summary_for_month', { month: format(new Date(), 'MMMM yyyy') })}
              </p>
            </CardContent>
          </Card>

          {/* Financial Summary Card (Net Savings) */}
          <FinancialSummaryCard />
        </div>

        {/* Middle Row Charts and Progress */}
        <div className="grid gap-6 md:grid-cols-2">
          <MonthlySummaryChart data={monthlySummaryData} />
          <SpendingCategoriesChart data={spendingCategoriesData} />
          <BudgetOverviewCard /> {/* New Budget Overview Card */}
          <GoalsProgressCard /> {/* New Goals Progress Card */}
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
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {t(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
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