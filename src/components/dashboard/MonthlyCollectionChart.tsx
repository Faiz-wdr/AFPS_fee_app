import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { MonthlyCollection } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyCollectionChartProps {
  data: MonthlyCollection[];
}

interface MonthlyTooltipItem {
  color?: string;
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: MonthlyTooltipItem[];
  label?: string;
}

const formatYAxis = (val: number): string => {
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  return `₹${val / 1000}k`;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-dropdown)',
          fontSize: '12px'
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          {label} 2026
        </p>
        {payload.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              margin: '3px 0'
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {formatCurrency(item.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyCollectionChart: React.FC<MonthlyCollectionChartProps> = ({ data }) => {

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 className="section-heading" style={{ margin: 0 }}>
            Monthly Collection Trend
          </h2>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#EAEAF0' }}
              tick={{ fill: '#777777', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#777777', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(90, 84, 180, 0.04)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', color: '#777777' }}
            />
            <Bar
              name="School Fee"
              dataKey="schoolFee"
              fill="#5A54B4"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
            <Bar
              name="Bus Fee"
              dataKey="busFee"
              fill="#8B85E9"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
            <Bar
              name="Store Sales"
              dataKey="storeSales"
              fill="#249B62"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
