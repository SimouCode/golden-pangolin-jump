"use client";

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';
import { useBudgets, Budget } from '@/contexts/BudgetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EditBudgetDialog from '@/components/EditBudgetDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTransactions } from '@/contexts/TransactionContext';
import { cn, formatCurrency, getUniqueCategories } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BudgetsPage = () => {
  const { t } = useTranslation();
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();

  const [budgetName, setBudgetName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>(format(new Date(), 'yyyy-MM'));

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const uniqueCategories = useMemo(() => {
    return getUniqueCategories(transactions, budgets);
  }, [transactions, budgets]);

  const handleAddBudget = () => {
    const parsedAmount = parseFloat(amount);

    if (!budgetName || !category || isNaN(parsedAmount) || parsedAmount <= 0 || !monthYear) {
      showError(t('budget_save_error_fields'));
      return;
    }

    addBudget({
      name: budgetName,
      category,
      amount: parsedAmount,
      monthYear,
    });

    showSuccess(t('budget_saved_success'));
    // Reset form
    setBudgetName('');
    setCategory('');
    setAmount('');
    setMonthYear(format(new Date(), 'yyyy-MM'));
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    showSuccess(t('budget_deleted_success'));
  };

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditDialogOpen(true);
  };

  const calculateSpentAmount = (budget: Budget) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category.toLowerCase() === budget.category.toLowerCase() &&
          format(t.date, 'yyyy-MM') === budget.monthYear
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return spent;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('budgets')}</h2>
        <p className="text-muted-foreground">{t('budgets_page_description')}</p>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{t('add_new_budget')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetName">{t('budget_name')}</Label>
                <Input
                  id="budgetName"
                  placeholder={t('budget_name_placeholder')}
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('category_placeholder_budget')} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    {category && !uniqueCategories.includes(category) && (
                      <SelectItem value={category}>{t('add_new_category')}: {category}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  id="category-input"
                  placeholder={t('category_placeholder_budget')}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('budget_amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={formatCurrency(0, t('currency_locale'))}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthYear">{t('month_year')}</Label>
                <Input
                  id="monthYear"
                  placeholder="YYYY-MM"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                />
              </div>

              <Button type="submit" onClick={handleAddBudget} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('add_budget')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold tracking-tight mt-8">{t('your_budgets')}</h3>
        {budgets.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('no_budgets_yet')}
          </div>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => {
              const spent = calculateSpentAmount(budget);
              const progress = (spent / budget.amount) * 100;
              const isOverBudget = spent > budget.amount;
              const remaining = budget.amount - spent;

              return (
                <Card key={budget.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{budget.name} ({budget.monthYear})</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(budget)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('budget_delete_confirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBudget(budget.id)}>
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t('category')}: {budget.category}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('budgeted')}: {formatCurrency(budget.amount, t('currency_locale'))}
                    </p>
                    <p className={cn("text-sm font-medium", isOverBudget ? "text-destructive" : "text-foreground")}>
                      {t('spent')}: {formatCurrency(spent, t('currency_locale'))}
                    </p>
                    <p className={cn("text-sm font-medium", remaining < 0 ? "text-destructive" : "text-green-600")}>
                      {t('remaining')}: {formatCurrency(remaining, t('currency_locale'))}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className={cn("w-full", isOverBudget && "bg-destructive")} />
                      <span className={cn("text-sm font-medium", isOverBudget && "text-destructive")}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    {isOverBudget && (
                      <p className="text-sm text-destructive mt-2">
                        {t('over_budget_warning', { amount: formatCurrency(spent - budget.amount, t('currency_locale')) })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {selectedBudget && (
        <EditBudgetDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          budget={selectedBudget}
        />
      )}
    </Layout>
  );
};

export default BudgetsPage;