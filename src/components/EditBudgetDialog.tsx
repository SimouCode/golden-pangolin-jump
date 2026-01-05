"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Budget, useBudgets } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories'; // Import useCategories

interface EditBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

const EditBudgetDialog: React.FC<EditBudgetDialogProps> = ({ isOpen, onClose, budget }) => {
  const { t } = useTranslation();
  const { updateBudget } = useBudgets();
  const { categories, addCategory, isLoading: isLoadingCategories } = useCategories();

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');

  useEffect(() => {
    if (budget) {
      const currentCategory = categories.find(cat => cat.id === budget.category_id);
      setSelectedCategoryName(currentCategory?.name || '');
      setMonthlyLimit(budget.monthly_limit.toString());
      setMonth(budget.month.toString());
      setYear(budget.year.toString());
    }
  }, [budget, categories]);

  const availableCategories = useMemo(() => {
    return categories.filter(cat => cat.type === 'expense'); // Budgets are typically for expenses
  }, [categories]);

  const handleUpdateBudget = async () => {
    if (!budget) return;

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

    const updated = await updateBudget({
      id: budget.id,
      category_id: categoryId,
      monthly_limit: parsedMonthlyLimit,
      month: parsedMonth,
      year: parsedYear,
      spent: budget.spent, // Keep current spent amount
    });

    if (updated) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_budget')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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

          <div className="space-y-2">
            <Label htmlFor="month">{t('month')}</Label>
            <Input
              id="month"
              type="number"
              placeholder="MM"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleUpdateBudget}>{t('update')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBudgetDialog;