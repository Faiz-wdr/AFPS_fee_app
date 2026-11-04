import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize = 20,
  onPageChange,
  itemName = 'items'
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems < 20) return null;

  return (
    <div
      style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        backgroundColor: '#FFFFFF',
        flexWrap: 'wrap',
        gap: '8px'
      }}
    >
      <div>
        Showing <strong style={{ color: 'var(--color-text-primary)' }}>{startItem}-{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>{totalItems}</strong> {itemName}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{
              height: '28px',
              padding: '0 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: currentPage === 1 ? '#F9FAFB' : '#FFFFFF',
              color: currentPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          <span
            style={{
              padding: '0 6px',
              fontSize: '11px',
              color: 'var(--color-text-primary)',
              fontWeight: 600
            }}
          >
            {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            style={{
              height: '28px',
              padding: '0 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: currentPage >= totalPages ? '#F9FAFB' : '#FFFFFF',
              color: currentPage >= totalPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
