import { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { ReceiptModal } from '../components/common/ReceiptModal';
import type { PrintableReceiptData } from '../components/common/ReceiptModal';
import { SuccessScreen } from '../components/common/SuccessScreen';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { PaymentMethod } from '../types';
import {
  Printer,
  Search,
  CheckCircle
} from 'lucide-react';

export const VoucherManagement: React.FC = () => {
  const {
    vouchers,
    expenseCategories,
    createVoucher
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'categories'>('create');

  // Printable voucher modal
  const [printableReceipt, setPrintableReceipt] = useState<PrintableReceiptData | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<PrintableReceiptData | null>(null);

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string>(expenseCategories[0]?.id || 'exp-01');
  const [description, setDescription] = useState<string>('');
  const [paidTo, setPaidTo] = useState<string>('');
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [preparedBy, setPreparedBy] = useState<string>('Accounts Officer');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [voucherPage, setVoucherPage] = useState(1);

  // Overview metrics
  const overview = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let expensesToday = 0;
    let expensesThisMonth = 0;
    let cashExpenses = 0;
    let bankExpenses = 0;

    vouchers.forEach(v => {
      const vDate = new Date(v.date);
      if (v.date === todayStr) {
        expensesToday += v.amount;
      }
      if (vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear) {
        expensesThisMonth += v.amount;
      }
      if (v.paymentMethod === 'Cash') {
        cashExpenses += v.amount;
      } else {
        bankExpenses += v.amount;
      }
    });

    return {
      totalVouchers: vouchers.length,
      expensesToday,
      expensesThisMonth,
      cashExpenses,
      bankExpenses
    };
  }, [vouchers]);

  // Handle Create Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidTo.trim() || !description.trim() || amount <= 0) {
      alert("Please enter Paid To, Description, and a valid Amount.");
      return;
    }

    const newVoucher = createVoucher({
      date,
      categoryId,
      description,
      paidTo,
      amount,
      paymentMethod,
      referenceNo: referenceNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
      preparedBy: preparedBy.trim() || "Accounts Officer"
    });

    // Prepare Voucher Data & Open Animated Success Screen
    const receiptData: PrintableReceiptData = {
      type: 'voucher',
      receiptNumber: newVoucher.voucherNumber,
      date: newVoucher.date,
      title: 'Payment Disbursement Voucher',
      payeeOrStudent: newVoucher.paidTo,
      paidTo: newVoucher.paidTo,
      subInfo: `Expense Category: ${newVoucher.categoryName} • Mode: ${newVoucher.paymentMethod}`,
      paymentMethod: newVoucher.paymentMethod,
      referenceNo: newVoucher.referenceNo,
      items: [
        { label: newVoucher.description, amount: newVoucher.amount }
      ],
      totalAmount: newVoucher.amount,
      remarks: newVoucher.remarks,
      preparedBy: newVoucher.preparedBy
    };

    setSuccessReceipt(receiptData);

    // Reset Form
    setDescription('');
    setPaidTo('');
    setReferenceNo('');
    setRemarks('');
    setAmount(1000);
  };

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchesSearch = !searchQuery ||
        v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || v.categoryId === categoryFilter;
      const matchesMethod = methodFilter === 'All' || v.paymentMethod === methodFilter;
      return matchesSearch && matchesCategory && matchesMethod;
    });
  }, [vouchers, searchQuery, categoryFilter, methodFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Voucher Management</h1>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EAEAF0', borderRadius: '8px' }}>
          {[
            { id: 'create', label: 'Create Voucher' },
            { id: 'history', label: 'Voucher History' },
            { id: 'categories', label: 'Expense Categories' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'create' | 'history' | 'categories')}
              style={{
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#5A54B4' : 'var(--color-text-secondary)',
                backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* A. Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Vouchers</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {overview.totalVouchers} Vouchers
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-danger)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Expenses This Month</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
            {formatCurrency(overview.expensesThisMonth)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Expenses Today</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(overview.expensesToday)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cash vs Bank Expenses</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cash: {formatCurrency(overview.cashExpenses)}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Bank: {formatCurrency(overview.bankExpenses)}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: CREATE VOUCHER */}
      {activeTab === 'create' && (
        <Card
          title="Create Expense Disbursement Voucher"
          style={{ maxWidth: '780px' }}
        >
          <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Voucher Number (Auto Generated)
                </label>
                <input
                  type="text"
                  disabled
                  value={`VCH-2026-${1000 + vouchers.length + 1}`}
                  style={{ width: '100%', backgroundColor: '#F0F0F5', fontFamily: 'monospace', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Voucher Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Expense Category *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.description})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Paid To (Payee / Vendor / Person) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerala State Electricity Board (KSEB)"
                  value={paidTo}
                  onChange={e => setPaidTo(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Expense Description / Particulars *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KSEB monthly power bill for primary school block"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Disbursement Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="50"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '16px', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  style={{ width: '100%' }}
                >
                  <option value="Cash">Cash at Office</option>
                  <option value="Bank">Bank Transfer / NEFT</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Reference No (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Bill No / Cheque #"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Prepared By / Authorized Staff
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Officer / Estate Manager"
                  value={preparedBy}
                  onChange={e => setPreparedBy(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Remarks / Internal Audit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified by Principal"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button
                variant="primary"
                icon={<CheckCircle size={16} />}
                type="submit"
                style={{ height: '40px', padding: '0 20px' }}
              >
                Create Voucher & Print Preview
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: VOUCHER HISTORY */}
      {activeTab === 'history' && (
        <Card padding="0">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>Voucher Expense Ledger</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search voucher, payee..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Categories</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Modes</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Paid To</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Print / View</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers
                  .slice((voucherPage - 1) * 20, voucherPage * 20)
                  .map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {v.voucherNumber}
                    </td>
                    <td>{formatDate(v.date)}</td>
                    <td>
                      <Badge variant="purple">{v.categoryName}</Badge>
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '12px' }}>{v.description}</td>
                    <td style={{ fontWeight: 500 }}>{v.paidTo}</td>
                    <td>{v.paymentMethod}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-danger)' }}>
                      {formatCurrency(v.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant="secondary"
                        icon={<Printer size={13} />}
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        onClick={() => {
                          setPrintableReceipt({
                            type: 'voucher',
                            receiptNumber: v.voucherNumber,
                            date: v.date,
                            title: 'Payment Disbursement Voucher',
                            payeeOrStudent: v.paidTo,
                            paidTo: v.paidTo,
                            subInfo: `Category: ${v.categoryName} • Mode: ${v.paymentMethod}`,
                            paymentMethod: v.paymentMethod,
                            referenceNo: v.referenceNo,
                            items: [
                              { label: v.description, amount: v.amount }
                            ],
                            totalAmount: v.amount,
                            remarks: v.remarks,
                            preparedBy: v.preparedBy
                          });
                        }}
                      >
                        Voucher
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={voucherPage}
            totalItems={filteredVouchers.length}
            pageSize={20}
            onPageChange={setVoucherPage}
            itemName="vouchers"
          />
        </Card>
      )}

      {/* TAB 3: EXPENSE CATEGORIES */}
      {activeTab === 'categories' && (
        <Card title="Configured Expense Categories">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Code</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{cat.id}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{cat.description}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={cat.status === 'Active' ? 'success' : 'neutral'}>
                        {cat.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Animated Success Screen Modal */}
      {successReceipt && (
        <Modal
          isOpen={!!successReceipt}
          onClose={() => setSuccessReceipt(null)}
          title="Voucher Created"
          subtitle={`Voucher #${successReceipt.receiptNumber}`}
          maxWidth="480px"
        >
          <SuccessScreen
            title="Voucher Successfully Created!"
            amount={successReceipt.totalAmount}
            amountLabel="Disbursement Amount"
            details={[
              { value: <div style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--color-text-primary)' }}>{successReceipt.paidTo || successReceipt.payeeOrStudent}</div> },
              { value: <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>{successReceipt.subInfo}</div> },
              { value: <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>{successReceipt.paymentMethod}</div> }
            ]}
            secondaryAction={{
              label: 'Done',
              onClick: () => setSuccessReceipt(null)
            }}
            primaryAction={{
              label: 'Print / View Voucher',
              icon: <Printer size={15} />,
              onClick: () => setPrintableReceipt(successReceipt)
            }}
          />
        </Modal>
      )}

      {/* Printable Voucher Modal */}
      <ReceiptModal
        isOpen={!!printableReceipt}
        onClose={() => setPrintableReceipt(null)}
        data={printableReceipt}
      />
    </div>
  );
};
