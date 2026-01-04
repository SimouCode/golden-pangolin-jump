"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Budget {
  id: string;
  name: string;
  category: string; // e.g., "Food", "Transport"
  amount: number; // Budgeted amount for this category for the month
  monthYear: string; // Format: "YYYY-MM"
}

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    if (typeof window !== 'undefined') {
      const savedBudgets = localStorage.getItem('budgets');
      if (savedBudgets) {
        return JSON.parse(savedBudgets);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  const addBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budgetWithId: Budget = {
      ...newBudget,
      id: Date.now().toString(),
    };
    setBudgets((prevBudgets) => [...prevBudgets, budgetWithId]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) => (budget.id === updatedBudget.id ? updatedBudget : budget))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prevBudgets) => prevBudgets.filter((budget) => budget.id !== id));
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
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