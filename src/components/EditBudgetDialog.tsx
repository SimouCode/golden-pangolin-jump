"use client";

import React, { useState, useEffect } from 'react';
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

interface EditBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

const EditBudgetDialog: React.FC<EditBudgetDialogProps> = ({ isOpen, onClose, budget }) => {
  const { t } = useTranslation();
  const { updateBudget } = useBudgets();

  const [budgetName, setBudgetName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');

  useEffect(() => {
    if (budget) {
      setBudgetName(budget.name);
      setCategory(budget.category);
      setAmount(budget.amount.toString());
      setMonthYear(budget.monthYear);
    }
  }, [budget]);

  const handleUpdateBudget = () => {
    if (!budget) return;

    const parsedAmount = parseFloat(amount);

    if (!budgetName || !category || isNaN(parsedAmount) || parsedAmount <= 0 || !monthYear) {
      showError(t('budget_save_error_fields'));
      return;
    }

    updateBudget({
      ...budget,
      name: budgetName,
      category,
      amount: parsedAmount,
      monthYear,
    });

    showSuccess(t('budget_updated_success'));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_budget')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <Input
              id="category"
              placeholder={t('category_placeholder_budget')}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t('budget_amount')}</Label>
            <Input
              id="amount"
              type="number"
              placeholder={formatCurrency(0, 'DZD', t('currency_locale'))}
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