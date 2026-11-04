import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight, WalletCards } from 'lucide-react';

interface FinancialOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  totalIncome,
  totalExpenses,
  netBalance
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 className="section-heading" style={{ margin: 0 }}>
          Financial Overview
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Total Income */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Income
            </div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowUpRight size={20} />
          </div>
        </div>

        {/* Total Expenses */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Expenses
            </div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              {formatCurrency(totalExpenses)}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowDownRight size={20} />
          </div>
        </div>

        {/* Net Balance */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid var(--color-primary)',
            backgroundColor: '#FCFBFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Balance
            </div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              {formatCurrency(netBalance)}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WalletCards size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
