"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface MonthlySummaryChartProps {
  data: {
    name: string;
    income: number;
    expenses: number;
  }[];
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-2 text-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{t('monthly_summary')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]"> {/* Increased height for better visual */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" tickFormatter={(value) => formatCurrency(value, 'DZD', t('currency_locale'))} axisLine={false} />
              <Tooltip
                content={<CustomTooltip t={t} />}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="income" name={t('income')} fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name={t('expense')} fill="hsl(0 84.2% 60.2%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySummaryChart;