import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { LanguageProvider } from './contexts/LanguageContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { GoalProvider } from './contexts/GoalContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { ThemeProvider } from "next-themes"; // Import ThemeProvider

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddTransactionPage from "./pages/AddTransactionPage";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import GoalsPage from "./pages/GoalsPage";
import SettingsPage from "./pages/SettingsPage";
import BudgetsPage from "./pages/BudgetsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <TransactionProvider>
            <GoalProvider>
              <BudgetProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem> {/* Wrap with ThemeProvider */}
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/transactions" element={<TransactionsPage />} />
                      <Route path="/transactions/add" element={<AddTransactionPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/budgets" element={<BudgetsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ThemeProvider>
              </BudgetProvider>
            </GoalProvider>
          </TransactionProvider>
        </LanguageProvider>
      </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;