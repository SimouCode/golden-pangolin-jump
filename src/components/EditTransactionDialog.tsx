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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { Transaction, useTransactions } from '@/contexts/TransactionContext';
import { useCategories } from '@/hooks/use-categories'; // Import useCategories

interface EditTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({ isOpen, onClose, transaction }) => {
  const { t } = useTranslation();
  const { updateTransaction } = useTransactions();
  const { categories, addCategory, isLoading: isLoadingCategories } = useCategories();

  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      const currentCategory = categories.find(cat => cat.id === transaction.category_id);
      setSelectedCategoryName(currentCategory?.name || '');
      setDate(transaction.date);
      setNote(transaction.note || '');
      setLocation(transaction.location || '');
    }
  }, [transaction, categories]);

  const availableCategories = useMemo(() => {
    return categories.filter(cat => cat.type === type);
  }, [categories, type]);

  const handleUpdateTransaction = async () => {
    if (!transaction) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !selectedCategoryName || !date) {
      showError(t('transaction_save_error_fields'));
      return;
    }

    let categoryId: string | undefined;
    const existingCategory = availableCategories.find(cat => cat.name === selectedCategoryName);

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else if (newCategoryInput && newCategoryInput === selectedCategoryName) {
      const addedCategory = await addCategory(newCategoryInput, type);
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

    const updated = await updateTransaction({
      ...transaction,
      amount: parsedAmount,
      type,
      category_id: categoryId,
      date,
      note,
      location,
    });

    if (updated) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_transaction')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              placeholder={formatCurrency(0, t('currency_locale'))}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('type')}</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => {
              setType(value);
              setSelectedCategoryName(''); // Reset category when type changes
              setNewCategoryInput('');
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t('income')}</SelectItem>
                <SelectItem value="expense">{t('expense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <SelectValue placeholder={t('category_placeholder_transaction')} />
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
            <Label htmlFor="date">{t('date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>{t('pick_a_date')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('note')}</Label>
            <Textarea
              id="note"
              placeholder={t('note_placeholder_transaction')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('location')}</Label>
            <Input
              id="location"
              placeholder={t('location_placeholder_transaction')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleUpdateTransaction}>{t('update')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;