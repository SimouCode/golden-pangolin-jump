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
import { cn, formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories'; // Import useCategories

const BudgetsPage = () => {
  const { t } = useTranslation();
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { categories, addCategory, isLoading: isLoadingCategories } = useCategories();

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [month, setMonth] = useState<string>(format(new Date(), 'MM'));
  const [year, setYear] = useState<string>(format(new Date(), 'yyyy'));

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const availableCategories = useMemo(() => {
    return categories.filter(cat => cat.type === 'expense'); // Budgets are typically for expenses
  }, [categories]);

  const handleAddBudget = async () => {
    const parsedMonthlyLimit = parseFloat(monthlyLimit);
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    if (!selectedCategoryName || isNaN(parsedMonthlyLimit) || parsedMonthlyLimit <= 0 || isNaN(parsedMonth) || isNaN(parsedYear)) {
      showError(t('budget_save_error_fields'));
      return;
    }

    let categoryId: string | undefined;
    const existingCategory = availableCategories.find(cat => cat.name === selectedCategoryName);

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else if (newCategoryInput && newCategoryInput === selectedCategoryName) {
      const addedCategory = await addCategory(newCategoryInput, 'expense');
      if (addedCategory) {
        categoryId = addedCategory.id;
      } else {
        showError(t('error_adding_category'));
        return;
      }
    } else {
      showError(t('error_invalid_category'));
      return;
    }

    if (!categoryId) {
      showError(t('error_invalid_category'));
      return;
    }

    const newBudget = await addBudget({
      category_id: categoryId,
      monthly_limit: parsedMonthlyLimit,
      month: parsedMonth,
      year: parsedYear,
    });

    if (newBudget) {
      // Reset form
      setSelectedCategoryName('');
      setNewCategoryInput('');
      setMonthlyLimit('');
      setMonth(format(new Date(), 'MM'));
      setYear(format(new Date(), 'yyyy'));
    }
  };

  const handleDeleteBudget = async (id: string) => {
    const success = await deleteBudget(id);
    if (success) {
      showSuccess(t('budget_deleted_success'));
    }
  };

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditDialogOpen(true);
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
                <Label htmlFor="category">{t('category')}</Label>
                <Select
                  value={selectedCategoryName}
                  onValueChange={(value) => {
                    setSelectedCategoryName(value);
                    setNewCategoryInput('');
                  }}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('category_placeholder_budget')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="new-category-input"
                  placeholder={t('add_new_category')}
                  value={newCategoryInput}
                  onChange={(e) => {
                    setNewCategoryInput(e.target.value);
                    setSelectedCategoryName(e.target.value);
                  }}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">{t('budget_amount')}</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  placeholder={formatCurrency(0, t('currency_locale'))}
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">{t('month')}</Label>
                  <Input
                    id="month"
                    type="number"
                    placeholder="MM"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    min="1"
                    max="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">{t('year')}</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="YYYY"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="2000"
                    max="2100"
                  />
                </div>
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
              const categoryName = categories.find(cat => cat.id === budget.category_id)?.name || t('unknown_category');
              const progress = (budget.spent / budget.monthly_limit) * 100;
              const isOverBudget = budget.spent > budget.monthly_limit;
              const remaining = budget.monthly_limit - budget.spent;

              return (
                <Card key={budget.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{categoryName} ({budget.year}-{String(budget.month).padStart(2, '0')})</CardTitle>
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
                      {t('budgeted')}: {formatCurrency(budget.monthly_limit, t('currency_locale'))}
                    </p>
                    <p className={cn("text-sm font-medium", isOverBudget ? "text-destructive" : "text-foreground")}>
                      {t('spent')}: {formatCurrency(budget.spent, t('currency_locale'))}
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
                        {t('over_budget_warning', { amount: formatCurrency(budget.spent - budget.monthly_limit, t('currency_locale')) })}
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