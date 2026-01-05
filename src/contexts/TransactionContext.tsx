"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  note?: string;
  date: Date;
  created_at: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<Transaction | null>;
  updateTransaction: (transaction: Omit<Transaction, 'user_id' | 'created_at'>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSession();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        setError(error.message);
        showError(t('error_fetching_transactions'));
      } else {
        setTransactions(data ? data.map(t => ({ ...t, date: new Date(t.date) })) : []);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchTransactions();

    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchTransactions(); // Re-fetch transactions on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t]);

  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...newTransaction,
        user_id: user.id,
        date: format(newTransaction.date, 'yyyy-MM-dd'), // Format date for Supabase
      })
      .select();

    if (error) {
      console.error('Error adding transaction:', error);
      showError(t('error_adding_transaction'));
      return null;
    }
    showSuccess(t('transaction_saved_success'));
    return data ? { ...data[0], date: new Date(data[0].date) } : null;
  };

  const updateTransaction = async (updatedTransaction: Omit<Transaction, 'user_id' | 'created_at'>) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('transactions')
      .update({
        category_id: updatedTransaction.category_id,
        amount: updatedTransaction.amount,
        type: updatedTransaction.type,
        note: updatedTransaction.note,
        date: format(updatedTransaction.date, 'yyyy-MM-dd'), // Format date for Supabase
      })
      .eq('id', updatedTransaction.id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating transaction:', error);
      showError(t('error_updating_transaction'));
      return null;
    }
    showSuccess(t('transaction_updated_success'));
    return data ? { ...data[0], date: new Date(data[0].date) } : null;
  };

  const deleteTransaction = async (id: string) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return false;
    }
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      showError(t('error_deleting_transaction'));
      return false;
    }
    showSuccess(t('transaction_deleted_success'));
    return true;
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, isLoading, error }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};