"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

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

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal }}>
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