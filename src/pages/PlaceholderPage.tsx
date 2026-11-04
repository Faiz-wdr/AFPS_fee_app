import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  moduleName: string;
  category: string;
  onBackToDashboard: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  moduleName,
  category,
  onBackToDashboard
}) => {
  return (
    <div style={{ maxWidth: '680px', margin: '40px auto 0 auto' }}>
      <Card padding="36px 32px">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Clock size={24} />
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-secondary)',
              marginBottom: '6px'
            }}
          >
            {category} Module
          </span>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            {moduleName}
          </h2>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '420px', lineHeight: 1.6, marginBottom: '24px' }}>
            This module route is registered and prepared. Implementation of forms, ledgers, and transactions will be released in Phase 3.
          </p>

          <Button
            variant="secondary"
            icon={<ArrowLeft size={15} />}
            onClick={onBackToDashboard}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
