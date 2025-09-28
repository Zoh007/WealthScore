"use client";

import { useState, useEffect } from 'react';

export interface Goal {
  id?: string;
  name: string;
  amount: number;
  targetDate: string;
  description?: string;
}

const GOALS_STORAGE_KEY = 'finapp-goals';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } else {
        // Set default goals if none exist
        const defaultGoals = [
          { id: '1', name: 'Vacation to Italy', amount: 5000, targetDate: '2026-05-10' },
          { id: '2', name: 'Car Upgrades', amount: 2500, targetDate: '2025-12-25' }
        ];
        setGoals(defaultGoals);
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(defaultGoals));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      // Set default goals on error
      const defaultGoals = [
        { id: '1', name: 'Vacation to Italy', amount: 5000, targetDate: '2026-05-10' },
        { id: '2', name: 'Car Upgrades', amount: 2500, targetDate: '2025-12-25' }
      ];
      setGoals(defaultGoals);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      } catch (error) {
        console.error('Error saving goals:', error);
      }
    }
  }, [goals, isLoading]);

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goalWithId = {
      ...newGoal,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, goalWithId]);
    return goalWithId;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getGoalById = (id: string) => {
    return goals.find(goal => goal.id === id);
  };

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalById
  };
}