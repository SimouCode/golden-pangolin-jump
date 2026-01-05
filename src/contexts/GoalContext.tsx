"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline?: Date;
  description?: string;
  created_at: string;
}

interface GoalContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'saved_amount' | 'created_at'>) => Promise<Goal | null>;
  updateGoal: (goal: Omit<Goal, 'user_id' | 'created_at'>) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSession();
  const { t } = useTranslation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    const fetchGoals = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        setError(error.message);
        showError(t('error_fetching_goals'));
      } else {
        setGoals(data ? data.map(g => ({ ...g, deadline: g.deadline ? new Date(g.deadline) : undefined })) : []);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchGoals();

    const channel = supabase
      .channel('public:savings_goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchGoals(); // Re-fetch goals on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t]);

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'user_id' | 'saved_amount' | 'created_at'>) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        ...newGoal,
        user_id: user.id,
        saved_amount: 0, // Initialize saved_amount to 0
        deadline: newGoal.deadline ? format(newGoal.deadline, 'yyyy-MM-dd') : null, // Format date for Supabase
      })
      .select();

    if (error) {
      console.error('Error adding goal:', error);
      showError(t('error_adding_goal'));
      return null;
    }
    showSuccess(t('goal_saved_success'));
    return data ? { ...data[0], deadline: data[0].deadline ? new Date(data[0].deadline) : undefined } : null;
  };

  const updateGoal = async (updatedGoal: Omit<Goal, 'user_id' | 'created_at'>) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        name: updatedGoal.name,
        target_amount: updatedGoal.target_amount,
        saved_amount: updatedGoal.saved_amount,
        deadline: updatedGoal.deadline ? format(updatedGoal.deadline, 'yyyy-MM-dd') : null, // Format date for Supabase
        description: updatedGoal.description,
      })
      .eq('id', updatedGoal.id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating goal:', error);
      showError(t('error_updating_goal'));
      return null;
    }
    showSuccess(t('goal_updated_success'));
    return data ? { ...data[0], deadline: data[0].deadline ? new Date(data[0].deadline) : undefined } : null;
  };

  const deleteGoal = async (id: string) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return false;
    }
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      showError(t('error_deleting_goal'));
      return false;
    }
    showSuccess(t('goal_deleted_success'));
    return true;
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, isLoading, error }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};