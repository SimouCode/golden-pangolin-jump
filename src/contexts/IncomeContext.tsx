"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Income {
  id: string;
  amount: number;
  type: string; // e.g., "Salary", "Freelance", "Bonus"
  date: Date;
  note?: string;
  monthYear: string; // Format: "YYYY-MM"
}

interface IncomeContextType {
  incomeEntries: Income[];
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export const IncomeProvider = ({ children }: { children: ReactNode }) => {
  const [incomeEntries, setIncomeEntries] = useState<Income[]>(() => {
    if (typeof window !== 'undefined') {
      const savedIncome = localStorage.getItem('incomeEntries');
      if (savedIncome) {
        return JSON.parse(savedIncome).map((i: any) => ({
          ...i,
          date: new Date(i.date),
        }));
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
    }
  }, [incomeEntries]);

  const addIncome = (newIncome: Omit<Income, 'id'>) => {
    const incomeWithId: Income = {
      ...newIncome,
      id: Date.now().toString(),
    };
    setIncomeEntries((prevIncome) => [...prevIncome, incomeWithId]);
  };

  const updateIncome = (updatedIncome: Income) => {
    setIncomeEntries((prevIncome) =>
      prevIncome.map((income) => (income.id === updatedIncome.id ? updatedIncome : income))
    );
  };

  const deleteIncome = (id: string) => {
    setIncomeEntries((prevIncome) => prevIncome.filter((income) => income.id !== id));
  };

  return (
    <IncomeContext.Provider value={{ incomeEntries, addIncome, updateIncome, deleteIncome }}>
      {children}
    </IncomeContext.Provider>
  );
};

export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (context === undefined) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
};