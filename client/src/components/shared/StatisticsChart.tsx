import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { formatBTC } from '@/lib/utils';

interface ChartData {
  month: string;
  deposits: number;
  withdrawals: number;
  repayments: number;
  disbursements: number;
}

interface StatisticsChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-md">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm flex items-center">
            <span
              className="inline-block w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="mr-2">{entry.name}:</span>
            <span className="font-medium">{formatBTC(entry.value as number)}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export function StatisticsChart({ data }: StatisticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))' }} />
        <YAxis 
          tickFormatter={(value) => `${value.toFixed(2)}`} 
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="deposits" 
          name="Deposits" 
          stackId="a" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          dataKey="withdrawals" 
          name="Withdrawals" 
          stackId="a" 
          fill="hsl(var(--destructive))" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          dataKey="repayments" 
          name="Repayments" 
          stackId="a" 
          fill="hsl(var(--success))" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          dataKey="disbursements" 
          name="Disbursements" 
          stackId="a" 
          fill="hsl(var(--accent))" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
