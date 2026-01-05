"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface SpendingCategoriesChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#8884d8', '#82ca9d'];

const CustomTooltip = ({ active, payload, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-2 text-sm">
        <p className="font-bold mb-1">{payload[0].name}</p>
        <p>{t('amount')}: {formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const SpendingCategoriesChart: React.FC<SpendingCategoriesChartProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{t('top_spending_categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]"> {/* Increased height for better visual */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip t={t} />}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingCategoriesChart;