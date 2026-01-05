"use client";

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions, Transaction } from '@/contexts/TransactionContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format, isWithinInterval } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';
import EditTransactionDialog from '@/components/EditTransactionDialog';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Card } from '@/components/ui/card'; // Import Card

const TransactionsPage = () => {
  const { t } = useTranslation();
  const { transactions, deleteTransaction } = useTransactions();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Sort states
  const [sortKey, setSortKey] = useState<keyof Transaction | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    transactions.forEach((t) => categories.add(t.category));
    return ['all', ...Array.from(categories).sort()];
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((t) =>
        isWithinInterval(t.date, { start: dateRange.from!, end: dateRange.to! })
      );
    } else if (dateRange?.from) {
      filtered = filtered.filter((t) => t.date >= dateRange.from!);
    }


    // Apply sorting
    if (sortKey) {
      filtered.sort((a, b) => {
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

    return filtered;
  }, [transactions, filterCategory, filterType, dateRange, sortKey, sortDirection]);

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    showSuccess(t('transaction_deleted_success'));
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleSort = (key: keyof Transaction) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{t('transactions')}</h2>
          <Button asChild>
            <Link to="/transactions/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('add_new_transaction')}
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">{t('transactions_page_description')}</p>

        {/* Filters and Sort */}
        <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('filter_by_category')} />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? t('all_categories') : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filter_by_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_types')}</SelectItem>
                <SelectItem value="income">{t('income')}</SelectItem>
                <SelectItem value="expense">{t('expense')}</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>{t('pick_a_date_range')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={() => {
              setFilterCategory('all');
              setFilterType('all');
              setDateRange(undefined);
              setSortKey('date');
              setSortDirection('desc');
            }}>
              {t('clear_filters')}
            </Button>
          </div>
        </Card>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('no_transactions_found')}
            <div className="mt-4">
              <Button asChild>
                <Link to="/transactions/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('add_new_transaction')}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      {t('date')}
                      {sortKey === 'date' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                    <div className="flex items-center">
                      {t('category')}
                      {sortKey === 'category' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
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
                  <TableHead>{t('location')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(transaction.date, 'PPP')}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {t(transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, t('currency_locale'))}
                    </TableCell>
                    <TableCell>{transaction.note || '-'}</TableCell>
                    <TableCell>{transaction.location || '-'}</TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(transaction)}>
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
                              {t('transaction_delete_confirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
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
      {selectedTransaction && (
        <EditTransactionDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          transaction={selectedTransaction}
        />
      )}
    </Layout>
  );
};

export default TransactionsPage;