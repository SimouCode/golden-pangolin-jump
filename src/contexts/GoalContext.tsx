"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: Date;
  description?: string;
}

interface GoalContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedGoals = localStorage.getItem('goals');
      if (savedGoals) {
        // Parse dates back into Date objects
        return JSON.parse(savedGoals).map((g: any) => ({
          ...g,
          dueDate: g.dueDate ? new Date(g.dueDate) : undefined,
        }));
      }
    }
    return [];
  });

  // Save to localStorage whenever goals change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goalWithId: Goal = {
      ...newGoal,
      id: Date.now().toString(), // Simple unique ID generation
    };
    setGoals((prevGoals) => [...prevGoals, goalWithId]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal }}>
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