import React from 'react';
import { Button } from '../ui/Button';
import { GraduationCap, Bus, ShoppingBag, Receipt } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (actionName: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <Button
        variant="primary"
        icon={<GraduationCap size={15} />}
        onClick={() => onActionClick("Collect School Fee")}
      >
        Collect School Fee
      </Button>

      <Button
        variant="secondary"
        icon={<Bus size={15} />}
        onClick={() => onActionClick("Collect Bus Fee")}
      >
        Collect Bus Fee
      </Button>

      <Button
        variant="secondary"
        icon={<ShoppingBag size={15} />}
        onClick={() => onActionClick("New Store Sale")}
      >
        New Store Sale
      </Button>

      <Button
        variant="secondary"
        icon={<Receipt size={15} />}
        onClick={() => onActionClick("Create Voucher")}
      >
        Create Voucher
      </Button>
    </div>
  );
};
