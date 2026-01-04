"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/contexts/TransactionContext'; // Import useTransactions
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const TransactionsPage = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions(); // Get transactions from context

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{t('transactions')}</h2>
          <Button asChild>
            <Link to="/transactions/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('add_new_transaction')}
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">{t('transactions_page_description')}</p>

        {transactions.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('no_transactions_yet')}
            <div className="mt-4">
              <Button asChild>
                <Link to="/transactions/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('add_new_transaction')}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                  <TableHead>{t('note')}</TableHead>
                  <TableHead>{t('location')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(transaction.date, 'PPP')}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {t(transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'income' ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.note || '-'}</TableCell>
                    <TableCell>{transaction.location || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionsPage;