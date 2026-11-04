import React, { useState } from 'react';
import type { Transaction } from '../../types';
import { Badge } from '../ui/Badge';
import { Pagination } from '../ui/Pagination';
import type { BadgeVariant } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  onViewAll
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = filterCategory === 'all'
    ? transactions
    : transactions.filter(t => t.category.toLowerCase().includes(filterCategory.toLowerCase()));

  const getCategoryBadgeVariant = (category: string): BadgeVariant => {
    switch (category) {
      case 'School Fee':
        return 'purple';
      case 'Bus Fee':
        return 'neutral';
      case 'Sales':
        return 'success';
      case 'Voucher':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Table Header Controls */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 className="section-heading" style={{ margin: 0 }}>
            Recent Transactions
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              height: '32px',
              fontSize: '12px',
              padding: '0 8px',
              borderRadius: '6px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            <option value="school fee">School Fee</option>
            <option value="bus fee">Bus Fee</option>
            <option value="sales">Sales</option>
            <option value="voucher">Voucher</option>
          </select>

          {/* View All Link */}
          <button
            onClick={onViewAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '4px'
            }}
          >
            <span>View All</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Txn ID</th>
              <th style={{ width: '120px' }}>Date</th>
              <th>Particulars</th>
              <th style={{ width: '130px' }}>Category</th>
              <th style={{ width: '110px' }}>Method</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions
              .slice((currentPage - 1) * 20, currentPage * 20)
              .map((txn) => {
              const isExpense = txn.type === 'expense';
              return (
                <tr key={txn.id}>
                  {/* ID */}
                  <td style={{ fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                    {txn.id}
                  </td>

                  {/* Date */}
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    {formatDate(txn.date)}
                  </td>

                  {/* Particulars */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {txn.particulars}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <Badge variant={getCategoryBadgeVariant(txn.category)}>
                      {txn.category}
                    </Badge>
                  </td>

                  {/* Payment Method */}
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {txn.method}
                  </td>

                  {/* Amount with clear income/expense indicator */}
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '2px',
                        color: isExpense ? 'var(--color-danger)' : 'var(--color-success)',
                        fontSize: '13px'
                      }}
                    >
                      {isExpense ? (
                        <>
                          <ArrowDownRight size={13} />
                          <span>- {formatCurrency(txn.amount)}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={13} />
                          <span>+ {formatCurrency(txn.amount)}</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <Badge variant={getStatusBadgeVariant(txn.status)}>
                      {txn.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredTransactions.length}
        pageSize={20}
        onPageChange={setCurrentPage}
        itemName="transactions"
      />
    </div>
  );
};
