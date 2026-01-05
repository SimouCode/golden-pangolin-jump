"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/utils/toast';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export const useCategories = () => {
  const { user } = useSession();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    const fetchCategories = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
        showError(t('error_fetching_categories'));
      } else {
        setCategories(data || []);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchCategories();

    const channel = supabase
      .channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchCategories(); // Re-fetch categories on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t]);

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, type })
      .select();

    if (error) {
      console.error('Error adding category:', error);
      showError(t('error_adding_category'));
      return null;
    }
    showSuccess(t('category_added_success'));
    return data ? data[0] : null;
  };

  const updateCategory = async (id: string, name: string, type: 'income' | 'expense') => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return null;
    }
    const { data, error } = await supabase
      .from('categories')
      .update({ name, type })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating category:', error);
      showError(t('error_updating_category'));
      return null;
    }
    showSuccess(t('category_updated_success'));
    return data ? data[0] : null;
  };

  const deleteCategory = async (id: string) => {
    if (!user) {
      showError(t('error_not_authenticated'));
      return false;
    }
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting category:', error);
      showError(t('error_deleting_category'));
      return false;
    }
    showSuccess(t('category_deleted_success'));
    return true;
  };

  const uniqueCategoryNames = useMemo(() => {
    return Array.from(new Set(categories.map(c => c.name))).sort((a, b) => a.localeCompare(b));
  }, [categories]);

  return { categories, uniqueCategoryNames, isLoading, error, addCategory, updateCategory, deleteCategory };
};