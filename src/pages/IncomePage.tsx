"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { useIncome, Income } from '@/contexts/IncomeContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// New component for editing income, similar to EditTransactionDialog
interface EditIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  income: Income | null;
}

const EditIncomeDialog: React.FC<EditIncomeDialogProps> = ({ isOpen, onClose, income }) => {
  const { t } = useTranslation();
  const { updateIncome } = useIncome();

  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (income) {
      setAmount(income.amount.toString());
      setType(income.type);
      setDate(income.date);
      setNote(income.note || '');
    }
  }, [income]);

  const handleUpdateIncome = () => {
    if (!income) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !type || !date) {
      showError(t('income_save_error_fields'));
      return;
    }

    updateIncome({
      ...income,
      amount: parsedAmount,
      type,
      date,
      note,
      monthYear: format(date, 'yyyy-MM'),
    });

    showSuccess(t('income_updated_success'));
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('edit_income')}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('type')}</Label>
            <Input
              id="type"
              placeholder="e.g., Salary, Bonus"
              value={type}
              onChange={(e) => setType(e.target.value)}
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
              placeholder={t('note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdateIncome}>{t('update')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


const IncomePage = () => {
  const { t } = useTranslation();
  const { incomeEntries, addIncome, deleteIncome } = useIncome();

  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState<string>('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  // Sort states
  const [sortKey, setSortKey] = useState<keyof Income | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleAddIncome = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !type || !date) {
      showError(t('income_save_error_fields'));
      return;
    }

    addIncome({
      amount: parsedAmount,
      type,
      date,
      note,
      monthYear: format(date, 'yyyy-MM'),
    });

    showSuccess(t('income_saved_success'));
    // Reset form
    setAmount('');
    setType('');
    setDate(new Date());
    setNote('');
  };

  const handleDeleteIncome = (id: string) => {
    deleteIncome(id);
    showSuccess(t('income_deleted_success'));
  };

  const handleEditClick = (income: Income) => {
    setSelectedIncome(income);
    setIsEditDialogOpen(true);
  };

  const handleSort = (key: keyof Income) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedIncomeEntries = useMemo(() => {
    let sorted = [...incomeEntries];
    if (sortKey) {
      sorted.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sorted;
  }, [incomeEntries, sortKey, sortDirection]);


  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('income_tracking')}</h2>
        <p className="text-muted-foreground">{t('income_page_description')}</p>

        <Card>
          <CardHeader>
            <CardTitle>{t('add_new_income')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t('amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t('type')}</Label>
                <Input
                  id="type"
                  placeholder="e.g., Salary, Bonus"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
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
                  placeholder={t('note')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button type="submit" onClick={handleAddIncome} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('add_income')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold tracking-tight mt-8">{t('your_income_history')}</h3>
        {incomeEntries.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('no_income_yet')}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      {t('date')}
                      {sortKey === 'date' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center">
                      {t('type')}
                      {sortKey === 'type' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">
                      {t('amount')}
                      {sortKey === 'amount' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                    </div>
                  </TableHead>
                  <TableHead>{t('note')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIncomeEntries.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{format(income.date, 'PPP')}</TableCell>
                    <TableCell>{income.type}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(income.amount)}
                    </TableCell>
                    <TableCell>{income.note || '-'}</TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(income)}>
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
                              {t('income_delete_confirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteIncome(income.id)}>
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {selectedIncome && (
        <EditIncomeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          income={selectedIncome}
        />
      )}
    </Layout>
  );
};

export default IncomePage;