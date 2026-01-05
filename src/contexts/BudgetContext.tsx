"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/utils/toast';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  spent: number;
  month: number;
  year: number;
  created_at: string;
}

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'spent' | 'created_at'>) => Promise<Budget | null>;
  updateBudget: (budget: Omit<Budget, 'user_id' | 'created_at'>) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSession();
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    const fetchBudgets = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Error fetching budgets:', error);
        setError(error.message);
        showError(t('error_fetching_budgets'));
      } else {
        setBudgets(data || []);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchBudgets();

    const channel = supabase
      .channel('public:budgets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchBudgets(); // Re-fetch budgets on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t]);

  const addBudget = async (newBudget: Omit<Budget, 'id' | 'user_id' | 'spent' | 'created_at'>) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...newBudget,
        user_id: user.id,
        spent: 0, // Initialize spent to 0
      })
      .select();

    if (error) {
      console.error('Error adding budget:', error);
      showError(t('error_adding_budget'));
      return null;
    }
    showSuccess(t('budget_saved_success'));
    return data ? data[0] : null;
  };

  const updateBudget = async (updatedBudget: Omit<Budget, 'user_id' | 'created_at'>) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('budgets')
      .update({
        category_id: updatedBudget.category_id,
        monthly_limit: updatedBudget.monthly_limit,
        month: updatedBudget.month,
        year: updatedBudget.year,
      })
      .eq('id', updatedBudget.id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating budget:', error);
      showError(t('error_updating_budget'));
      return null;
    }
    showSuccess(t('budget_updated_success'));
    return data ? data[0] : null;
  };

  const deleteBudget = async (id: string) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return false;
    }
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting budget:', error);
      showError(t('error_deleting_budget'));
      return false;
    }
    showSuccess(t('budget_deleted_success'));
    return true;
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget, isLoading, error }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};