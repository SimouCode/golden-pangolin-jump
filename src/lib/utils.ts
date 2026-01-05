import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transaction } from '@/contexts/TransactionContext';
import { Budget } from '@/contexts/BudgetContext';
import { Category } from '@/hooks/use-categories'; // Import Category interface

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: string = 'ar-DZ') {
  // Always use DZD as the currency code, locale determines symbol and formatting
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// This utility is no longer needed as categories are managed by useCategories hook
// export function getUniqueCategories(transactions: Transaction[], budgets: Budget[]): string[] {
//   const categories = new Set<string>();
//   transactions.forEach(t => categories.add(t.category));
//   budgets.forEach(b => categories.add(b.category));
//   return Array.from(categories).sort((a, b) => a.localeCompare(b));
// }