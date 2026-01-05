"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useBudgets } from '@/contexts/BudgetContext';
import { useGoals } from '@/contexts/GoalContext';
import { useIncome } from '@/contexts/IncomeContext'; // Import useIncome
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

const SmartRecommendations = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();
  const { incomeEntries } = useIncome(); // Use incomeEntries

  const recommendations = useMemo(() => {
    const tips: string[] = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthYear = format(new Date(), 'yyyy-MM');

    // --- Overall Financial Health ---
    if (transactions.length === 0 && incomeEntries.length === 0) {
      tips.push(t('recommendation_add_first_transaction'));
    } else {
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

      const netSavings = totalMonthlyIncome - monthlyExpenses;

      if (netSavings > 50000) { // Arbitrary "high" savings threshold for DZD
        tips.push(t('recommendation_great_savings'));
      } else if (netSavings > 0) {
        tips.push(t('recommendation_positive_savings'));
      } else if (netSavings < -10000) { // Arbitrary "high" overspending threshold for DZD
        tips.push(t('recommendation_high_expenses'));
      }
    }

    // --- Budget Performance ---
    budgets.forEach((budget) => {
      if (budget.monthYear === currentMonthYear) {
        const spent = transactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.category.toLowerCase() === budget.category.toLowerCase() &&
              format(t.date, 'yyyy-MM') === budget.monthYear
          )
          .reduce((sum, t) => sum + t.amount, 0);

        if (spent > budget.amount * 1.1) { // 10% over budget
          tips.push(t('recommendation_over_budget', { category: budget.category, amount: formatCurrency(spent - budget.amount, '', t('currency_locale')) }));
        } else if (spent < budget.amount * 0.8 && spent > 0) { // 20% under budget, but not 0
          tips.push(t('recommendation_under_budget', { category: budget.category }));
        } else if (spent === 0 && budget.amount > 0) {
          tips.push(t('recommendation_unused_budget', { category: budget.category }));
        }
      }
    });

    // --- Goal Progress ---
    goals.forEach((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      if (progress >= 90 && progress < 100) {
        tips.push(t('recommendation_goal_almost_reached', { goalName: goal.name }));
      } else if (progress >= 50 && progress < 90) {
        tips.push(t('recommendation_goal_good_progress', { goalName: goal.name }));
      } else if (progress === 0 && goal.targetAmount > 0) {
        tips.push(t('recommendation_goal_start_strong', { goalName: goal.name }));
      }
    });

    // If no specific tips, provide a general positive one
    if (tips.length === 0 && (transactions.length > 0 || incomeEntries.length > 0)) {
      tips.push(t('recommendation_general_positive'));
    }

    return tips;
  }, [transactions, budgets, goals, incomeEntries, t]);

  if (recommendations.length === 0) {
    return null; // Don't show the card if there are no recommendations
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('smart_recommendations')}</CardTitle>
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((tip, index) => (
          <Alert key={index} className="bg-muted/50 border-l-4 border-primary shadow-sm">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>{t('tip')}</AlertTitle>
            <AlertDescription>{tip}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;