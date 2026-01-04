"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('transactions')}</h2>
        <p className="text-muted-foreground">{t('transactions_page_description')}</p>

        {/* Placeholder for transaction list */}
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
      </div>
    </Layout>
  );
};

export default TransactionsPage;