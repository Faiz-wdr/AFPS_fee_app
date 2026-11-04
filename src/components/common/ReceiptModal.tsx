import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAppStore } from '../../context/useAppStore';

export interface PrintableReceiptData {
  type: 'fee' | 'bus' | 'sale' | 'voucher';
  receiptNumber: string;
  date: string;
  title: string;
  payeeOrStudent: string;
  subInfo?: string; // Admission No, Class, Route, etc.
  paymentMethod: string;
  referenceNo?: string;
  items: { label: string; amount: number }[];
  subtotal?: number;
  discount?: number;
  totalAmount: number;
  remarks?: string;
  preparedBy?: string;
  paidTo?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintableReceiptData | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { generalSettings } = useAppStore();
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${data.title} - ${data.receiptNumber}`}
      maxWidth="580px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<Printer size={15} />} onClick={handlePrint}>
            Print Receipt
          </Button>
        </>
      }
    >
      <div
        id="printable-receipt-area"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          color: '#1E1E1E',
          fontFamily: 'var(--font-stack)',
          fontSize: '13px'
        }}
      >
        {/* Header Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '2px solid #5A54B4',
            paddingBottom: '14px',
            marginBottom: '16px',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/favicon.svg?v=2"
              alt={generalSettings.logoText || 'School Logo'}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                display: 'block',
                flexShrink: 0,
                objectFit: 'contain'
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px', color: '#1E1E1E', textTransform: 'uppercase' }}>
                {generalSettings.schoolName || 'School Name'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#555555', marginTop: '2px', lineHeight: 1.35 }}>
                {generalSettings.schoolAddress}
              </div>
              {(generalSettings.phone || generalSettings.email) && (
                <div style={{ fontSize: '11px', color: '#777777', marginTop: '2px' }}>
                  {generalSettings.phone && <span>Ph: {generalSettings.phone}</span>}
                  {generalSettings.phone && generalSettings.email && <span> • </span>}
                  {generalSettings.email && <span>Email: {generalSettings.email}</span>}
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#F0EFFB',
                color: '#5A54B4',
                fontWeight: 600,
                fontSize: '11px',
                textTransform: 'uppercase'
              }}
            >
              {data.type === 'voucher' ? 'Expense Voucher' : 'Cash Receipt'}
            </div>
            <div style={{ fontSize: '11px', color: '#777777', marginTop: '4px' }}>
              {data.type === 'voucher'
                ? `FY ${generalSettings.financialYear || generalSettings.academicYear}`
                : `AY ${generalSettings.academicYear}`}
            </div>
          </div>
        </div>

        {/* Receipt Number & Date */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '10px 12px',
            backgroundColor: '#F7F7FA',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '12px'
          }}
        >
          <div>
            <span style={{ color: '#777777' }}>Receipt / Voucher No: </span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{data.receiptNumber}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#777777' }}>Date: </span>
            <span style={{ fontWeight: 600 }}>{formatDate(data.date)}</span>
          </div>
        </div>

        {/* Payee / Student Info */}
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#777777' }}>{data.type === 'voucher' ? 'Paid To: ' : 'Received From: '}</span>
            <span style={{ fontWeight: 600, color: '#1E1E1E' }}>{data.paidTo || data.payeeOrStudent}</span>
          </div>
          {data.subInfo && (
            <div style={{ fontSize: '12px', color: '#555555' }}>
              <span style={{ color: '#777777' }}>Particulars: </span>
              <span>{data.subInfo}</span>
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#555555' }}>
            <span style={{ color: '#777777' }}>Payment Mode: </span>
            <span style={{ fontWeight: 500 }}>{data.paymentMethod}</span>
            {data.referenceNo && (
              <span style={{ marginLeft: '10px', color: '#777777' }}>
                (Ref: {data.referenceNo})
              </span>
            )}
          </div>
        </div>

        {/* Line Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #EAEAF0', backgroundColor: '#FAFAFC' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', color: '#777777' }}>Sl.</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', color: '#777777' }}>Description</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11px', color: '#777777' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F0F0F5' }}>
                <td style={{ padding: '8px 10px', color: '#777777', width: '30px' }}>{idx + 1}</td>
                <td style={{ padding: '8px 10px', fontWeight: 500 }}>{item.label}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {data.discount !== undefined && data.discount > 0 && (
              <tr>
                <td colSpan={2} style={{ padding: '6px 10px', textAlign: 'right', color: '#777777', fontSize: '12px' }}>
                  Concession / Discount:
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#D94B4B', fontSize: '12px' }}>
                  - {formatCurrency(data.discount)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #EAEAF0' }}>
              <td colSpan={2} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>
                Total Paid Amount:
              </td>
              <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '16px', color: '#5A54B4' }}>
                {formatCurrency(data.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Remarks */}
        {data.remarks && (
          <div style={{ fontSize: '11px', color: '#777777', marginBottom: '14px', fontStyle: 'italic' }}>
            Note: {data.remarks}
          </div>
        )}

        {/* General Settings Legal Disclaimer / Footer Text */}
        {generalSettings.receiptFooterText && (
          <div
            style={{
              fontSize: '11px',
              color: '#666666',
              marginBottom: '16px',
              textAlign: 'center',
              lineHeight: 1.45,
              padding: '8px 12px',
              backgroundColor: '#F8F8FB',
              borderRadius: '6px',
              border: '1px solid #ECECF2'
            }}
          >
            {generalSettings.receiptFooterText}
          </div>
        )}

        {/* Signature placeholders */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px dashed #EAEAF0',
            marginTop: '16px'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '120px', borderTop: '1px solid #777777', paddingTop: '4px', fontSize: '11px', color: '#777777' }}>
              {data.preparedBy || 'Cashier / Prepared By'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#249B62', fontSize: '11px', fontWeight: 500 }}>
            <CheckCircle size={14} />
            <span>Verified & Authenticated</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '130px', borderTop: '1px solid #777777', paddingTop: '4px', fontSize: '11px', color: '#777777' }}>
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
