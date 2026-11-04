import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCollectionDistribution } from '../../data/dashboard';
import { formatCurrency } from '../../utils/formatters';

interface DistributionChartProps {
  totalCollection: number;
}

interface TooltipPayloadItem {
  payload: {
    name: string;
    value: number;
    percentage: string;
    color: string;
  };
}

interface CustomDonutTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomDonutTooltip: React.FC<CustomDonutTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-dropdown)',
          fontSize: '12px'
        }}
      >
        <div style={{ fontWeight: 600, color: data.color }}>{data.name}</div>
        <div style={{ color: 'var(--color-text-primary)', marginTop: '2px' }}>
          {formatCurrency(data.value)} ({data.percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

export const DistributionChart: React.FC<DistributionChartProps> = ({ totalCollection }) => {
  const distributionData = getCollectionDistribution();

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div>
        <h2 className="section-heading" style={{ margin: 0 }}>
          Collection Distribution
        </h2>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 200, margin: '10px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomDonutTooltip />} />
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Total
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {formatCurrency(totalCollection)}
          </div>
        </div>
      </div>

      {/* Legend Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
        {distributionData.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '2px',
                  backgroundColor: item.color,
                  flexShrink: 0
                }}
              />
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 400 }}>{item.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{item.percentage}%</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
