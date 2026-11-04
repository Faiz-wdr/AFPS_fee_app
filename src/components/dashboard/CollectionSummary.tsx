import type { CollectionSummaryData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { GraduationCap, Bus, ShoppingBag, FileSpreadsheet } from 'lucide-react';

interface CollectionSummaryProps {
  data: CollectionSummaryData;
}

export const CollectionSummary: React.FC<CollectionSummaryProps> = ({ data }) => {
  const cards = [
    {
      id: 'school-fee',
      title: 'School Fee Collection',
      amount: data.schoolFee,
      icon: GraduationCap,
      accentColor: '#5A54B4',
      accentBg: '#F0EFFB'
    },
    {
      id: 'bus-fee',
      title: 'Bus Fee Collection',
      amount: data.busFee,
      icon: Bus,
      accentColor: '#4A6CF7',
      accentBg: '#EEF2FF'
    },
    {
      id: 'store-sales',
      title: 'Store Sales',
      amount: data.storeSales,
      icon: ShoppingBag,
      accentColor: '#249B62',
      accentBg: '#EAF7EE'
    },
    {
      id: 'voucher-expenses',
      title: 'Voucher Expenses',
      amount: data.voucherExpenses,
      icon: FileSpreadsheet,
      accentColor: '#D94B4B',
      accentBg: '#FDF2F2'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '92px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {card.title}
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  backgroundColor: card.accentBg,
                  color: card.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={16} />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
                {formatCurrency(card.amount)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
