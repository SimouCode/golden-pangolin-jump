"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { useBudgets } from '@/contexts/BudgetContext';
import { useCategories } from '@/hooks/use-categories'; // Import useCategories
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const CategoryBudgetProgressCard = () => {
  const { t } = useTranslation();
  const { budgets } = useBudgets();
  const { categories } = useCategories();

  const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed
  const currentYear = new Date().getFullYear();
  const monthlyBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  if (monthlyBudgets.length === 0) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('monthly_budget_overview')}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('no_budgets_for_current_month')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('monthly_budget_overview')}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {monthlyBudgets.slice(0, 3).map(budget => { // Show top 3 budgets
          const categoryName = categories.find(cat => cat.id === budget.category_id)?.name || t('unknown_category');
          const spent = budget.spent;
          const progress = (spent / budget.monthly_limit) * 100;
          const isOverBudget = spent > budget.monthly_limit;
          const remaining = budget.monthly_limit - spent;

          return (
            <div key={budget.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{categoryName}</span>
                <span className={cn(isOverBudget ? "text-destructive" : "text-foreground")}>
                  {progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={progress} className={cn("h-2", isOverBudget && "bg-destructive")} />
              <p className="text-xs text-muted-foreground">
                {t('spent')}: {formatCurrency(spent, t('currency_locale'))} / {t('budgeted')}: {formatCurrency(budget.monthly_limit, t('currency_locale'))}
              </p>
              <p className={cn("text-xs", remaining < 0 ? "text-destructive" : "text-green-600")}>
                {t('remaining')}: {formatCurrency(remaining, t('currency_locale'))}
              </p>
            </div>
          );
        })}
        {monthlyBudgets.length > 3 && (
          <Button asChild variant="link" className="p-0 h-auto">
            <Link to="/budgets">{t('view_all_budgets')}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBudgetProgressCard;