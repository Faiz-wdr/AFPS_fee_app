import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Transaction, FundTransfer } from '../types';
import {
  Search,
  Download,
  Printer,
  ArrowRightLeft,
  Eye,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const FinanceManagement: React.FC = () => {
  const {
    transactions,
    transfers,
    paymentSettings,
    recordFundTransfer
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ledger' | 'cashBank' | 'income' | 'expenses'>('ledger');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'CashToBank' | 'BankToCash'>('CashToBank');
  const [transferAmount, setTransferAmount] = useState<number>(5000);
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transferRef, setTransferRef] = useState<string>('');
  const [transferDesc, setTransferDesc] = useState<string>('');
  const [transferOfficer, setTransferOfficer] = useState<string>('Accounts Officer');
  const [transferError, setTransferError] = useState<string>('');

  // Selected Transaction Details Modal
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Pagination for Ledger
  const [currentPage, setCurrentPage] = useState(1);
  const [transferPage, setTransferPage] = useState(1);
  const pageSize = 20;

  // Reconciled Balances Computation (Strict integer rupee arithmetic)
  const balances = useMemo(() => {
    let totalCashIncome = 0;
    let totalBankIncome = 0;
    let totalCashExpenses = 0;
    let totalBankExpenses = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        if (t.method === 'Cash') {
          totalCashIncome += t.amount;
        } else {
          totalBankIncome += t.amount;
        }
      } else if (t.type === 'expense') {
        if (t.method === 'Cash') {
          totalCashExpenses += t.amount;
        } else {
          totalBankExpenses += t.amount;
        }
      }
    });

    let cashToBankTotal = 0;
    let bankToCashTotal = 0;

    transfers.forEach(trf => {
      if (trf.fromAccount === 'Cash' && trf.toAccount === 'Bank') {
        cashToBankTotal += trf.amount;
      } else if (trf.fromAccount === 'Bank' && trf.toAccount === 'Cash') {
        bankToCashTotal += trf.amount;
      }
    });

    const openingCash = paymentSettings.openingCashBalance || 75000;
    const openingBank = paymentSettings.openingBankBalance || 450000;

    const currentCashBalance = openingCash + totalCashIncome - totalCashExpenses - cashToBankTotal + bankToCashTotal;
    const currentBankBalance = openingBank + totalBankIncome - totalBankExpenses + cashToBankTotal - bankToCashTotal;

    const totalIncome = totalCashIncome + totalBankIncome;
    const totalExpenses = totalCashExpenses + totalBankExpenses;
    const netBalance = totalIncome - totalExpenses;

    return {
      openingCash,
      openingBank,
      totalCashIncome,
      totalBankIncome,
      totalCashExpenses,
      totalBankExpenses,
      cashToBankTotal,
      bankToCashTotal,
      currentCashBalance,
      currentBankBalance,
      totalIncome,
      totalExpenses,
      netBalance
    };
  }, [transactions, transfers, paymentSettings]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.particulars.toLowerCase().includes(q) ||
        (t.referenceId && t.referenceId.toLowerCase().includes(q));

      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      const matchesMethod = methodFilter === 'All' || t.method === methodFilter;
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

      let matchesDate = true;
      if (startDate && t.date < startDate) matchesDate = false;
      if (endDate && t.date > endDate) matchesDate = false;

      return matchesSearch && matchesType && matchesMethod && matchesCategory && matchesDate;
    });
  }, [transactions, searchQuery, typeFilter, methodFilter, categoryFilter, startDate, endDate]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage]);

  // Income Breakdown by Source
  const incomeBreakdown = useMemo(() => {
    let schoolFee = 0;
    let busFee = 0;
    let storeSales = 0;

    let schoolFeeCash = 0;
    let schoolFeeBank = 0;
    let busFeeCash = 0;
    let busFeeBank = 0;
    let storeSalesCash = 0;
    let storeSalesBank = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        if (t.category === 'School Fee') {
          schoolFee += t.amount;
          if (t.method === 'Cash') schoolFeeCash += t.amount;
          else schoolFeeBank += t.amount;
        } else if (t.category === 'Bus Fee') {
          busFee += t.amount;
          if (t.method === 'Cash') busFeeCash += t.amount;
          else busFeeBank += t.amount;
        } else if (t.category === 'Sales') {
          storeSales += t.amount;
          if (t.method === 'Cash') storeSalesCash += t.amount;
          else storeSalesBank += t.amount;
        }
      }
    });

    return [
      { name: 'School Tuition Fee', total: schoolFee, cash: schoolFeeCash, bank: schoolFeeBank, route: '#/school-fee' },
      { name: 'Bus Conveyance Fee', total: busFee, cash: busFeeCash, bank: busFeeBank, route: '#/bus-fee' },
      { name: 'Store & Counter Sales', total: storeSales, cash: storeSalesCash, bank: storeSalesBank, route: '#/store-sales' },
    ];
  }, [transactions]);

  // Expense Breakdown by Category
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, { total: number; cash: number; bank: number; count: number }> = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        // extract descriptive category or fallback
        const cat = t.particulars.split(' - ')[1] || 'General Expense';
        const key = cat.length > 30 ? cat.slice(0, 30) + '...' : cat;
        if (!map[key]) {
          map[key] = { total: 0, cash: 0, bank: 0, count: 0 };
        }
        map[key].total += t.amount;
        map[key].count += 1;
        if (t.method === 'Cash') map[key].cash += t.amount;
        else map[key].bank += t.amount;
      }
    });

    return Object.entries(map).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Handle Transfer Submit
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (transferAmount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    if (transferDirection === 'CashToBank' && transferAmount > balances.currentCashBalance) {
      setTransferError(`Insufficient Cash balance. Available: ${formatCurrency(balances.currentCashBalance)}`);
      return;
    }

    if (transferDirection === 'BankToCash' && transferAmount > balances.currentBankBalance) {
      setTransferError(`Insufficient Bank balance. Available: ${formatCurrency(balances.currentBankBalance)}`);
      return;
    }

    const fromAccount = transferDirection === 'CashToBank' ? 'Cash' : 'Bank';
    const toAccount = transferDirection === 'CashToBank' ? 'Bank' : 'Cash';
    const description = transferDesc.trim() || `${fromAccount} to ${toAccount} contra fund transfer`;

    recordFundTransfer({
      date: transferDate,
      fromAccount,
      toAccount,
      amount: transferAmount,
      referenceNo: transferRef.trim() || undefined,
      description,
      transferredBy: transferOfficer.trim() || 'Accounts Officer'
    });

    setIsTransferModalOpen(false);
    setTransferDesc('');
    setTransferRef('');
    setTransferAmount(5000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Particulars', 'Category', 'Type', 'Payment Mode', 'Amount', 'Reference'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.id,
      `"${t.particulars.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.method,
      t.amount,
      t.referenceId || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Ledger
  const handlePrintLedger = () => {
    window.print();
  };

  // Resolve link to related origin entity
  const getOriginModuleLink = (txn: Transaction) => {
    if (txn.category === 'School Fee') return '#/school-fee';
    if (txn.category === 'Bus Fee') return '#/bus-fee';
    if (txn.category === 'Sales') return '#/store-sales';
    if (txn.category === 'Voucher') return '#/voucher';
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Finance Management</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            icon={<ArrowRightLeft size={14} />}
            onClick={() => setIsTransferModalOpen(true)}
          >
            Transfer Funds
          </Button>

          {/* Tab Controls */}
          <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EAEAF0', borderRadius: '8px' }}>
            {[
              { id: 'ledger', label: 'Transaction Ledger' },
              { id: 'cashBank', label: 'Cash & Bank' },
              { id: 'income', label: 'Income Sources' },
              { id: 'expenses', label: 'Expense Management' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'ledger' | 'cashBank' | 'income' | 'expenses')}
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
      </div>

      {/* Overview Metric Cards (5 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Income</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            {formatCurrency(balances.totalIncome)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Expenses</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
            {formatCurrency(balances.totalExpenses)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Net Operating Balance</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#5A54B4', marginTop: '4px' }}>
            {formatCurrency(balances.netBalance)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cash in Hand</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(balances.currentCashBalance)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bank Account Balance</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(balances.currentBankBalance)}
          </div>
        </div>
      </div>

      {/* TAB 1: TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <Card padding="0">
          {/* Filters Bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                  <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="text"
                    placeholder="Search transaction ID, particulars..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  style={{ height: '34px', fontSize: '12px', minWidth: '110px' }}
                >
                  <option value="All">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={e => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                  style={{ height: '34px', fontSize: '12px', minWidth: '110px' }}
                >
                  <option value="All">All Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  style={{ height: '34px', fontSize: '12px', minWidth: '120px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="School Fee">School Fee</option>
                  <option value="Bus Fee">Bus Fee</option>
                  <option value="Sales">Store Sales</option>
                  <option value="Voucher">Voucher</option>
                  <option value="Transfer">Fund Transfer</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={13} />}
                  onClick={handleExportCSV}
                >
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer size={13} />}
                  onClick={handlePrintLedger}
                >
                  Print
                </Button>
              </div>
            </div>

            {/* Date Range Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Date Range:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                style={{ height: '30px', fontSize: '12px', padding: '0 8px' }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                style={{ height: '30px', fontSize: '12px', padding: '0 8px' }}
              />
              {(startDate || endDate || searchQuery || typeFilter !== 'All' || methodFilter !== 'All' || categoryFilter !== 'All') && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSearchQuery('');
                    setTypeFilter('All');
                    setMethodFilter('All');
                    setCategoryFilter('All');
                    setCurrentPage(1);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#5A54B4',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Date</th>
                  <th style={{ width: '130px' }}>Txn ID</th>
                  <th>Particulars</th>
                  <th style={{ width: '110px' }}>Category</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Type</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Mode</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((t) => (
                    <tr key={`${t.id}-${t.category}`}>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {formatDate(t.date)}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                        {t.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.particulars}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{t.category}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge
                          variant={
                            t.type === 'income'
                              ? 'success'
                              : t.type === 'expense'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {t.type === 'income' ? 'Income' : t.type === 'expense' ? 'Expense' : 'Transfer'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>{t.method}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? 'var(--color-success)' : t.type === 'expense' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedTxn(t)}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer'
                          }}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTransactions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="transactions"
          />
        </Card>
      )}

      {/* TAB 2: CASH & BANK MANAGEMENT */}
      {activeTab === 'cashBank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Balances Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <Card title="Cash Ledger Account">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Opening Balance:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(balances.openingCash)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Cash Collections (Income):</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{formatCurrency(balances.totalCashIncome)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Cash Disbursements (Expense):</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{formatCurrency(balances.totalCashExpenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Net Transfers (Cash ⇄ Bank):</span>
                  <span style={{ fontWeight: 600, color: balances.bankToCashTotal - balances.cashToBankTotal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {balances.bankToCashTotal - balances.cashToBankTotal >= 0 ? '+' : ''}{formatCurrency(balances.bankToCashTotal - balances.cashToBankTotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', fontSize: '15px' }}>
                  <span style={{ fontWeight: 700 }}>Current Cash in Hand:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(balances.currentCashBalance)}</span>
                </div>
              </div>
            </Card>

            <Card title="Bank Ledger Account">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Opening Balance:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(balances.openingBank)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Bank Credits (Income):</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{formatCurrency(balances.totalBankIncome)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Bank Debits (Expense):</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{formatCurrency(balances.totalBankExpenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Net Transfers (Bank ⇄ Cash):</span>
                  <span style={{ fontWeight: 600, color: balances.cashToBankTotal - balances.bankToCashTotal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {balances.cashToBankTotal - balances.bankToCashTotal >= 0 ? '+' : ''}{formatCurrency(balances.cashToBankTotal - balances.bankToCashTotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', fontSize: '15px' }}>
                  <span style={{ fontWeight: 700 }}>Current Bank Balance:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(balances.currentBankBalance)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Transfers History Table */}
          <Card
            title="Fund Transfer History"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRightLeft size={13} />}
                onClick={() => setIsTransferModalOpen(true)}
              >
                Record Transfer
              </Button>
            }
          >
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transfer ID</th>
                    <th>Direction</th>
                    <th>Particulars</th>
                    <th>Reference</th>
                    <th>Authorized By</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
                        No fund transfer records found.
                      </td>
                    </tr>
                  ) : (
                    transfers.slice((transferPage - 1) * 20, transferPage * 20).map((trf: FundTransfer) => (
                      <tr key={trf.id}>
                        <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{formatDate(trf.date)}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>{trf.transferNumber}</td>
                        <td>
                          <Badge variant={trf.fromAccount === 'Cash' ? 'purple' : 'neutral'}>
                            {trf.fromAccount} → {trf.toAccount}
                          </Badge>
                        </td>
                        <td style={{ fontSize: '13px' }}>{trf.description}</td>
                        <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{trf.referenceNo || '—'}</td>
                        <td style={{ fontSize: '12px' }}>{trf.transferredBy}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {formatCurrency(trf.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={transferPage}
              totalItems={transfers.length}
              pageSize={20}
              onPageChange={setTransferPage}
              itemName="transfers"
            />
          </Card>
        </div>
      )}

      {/* TAB 3: INCOME SOURCES */}
      {activeTab === 'income' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {incomeBreakdown.map(src => (
              <div key={src.name} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {src.name}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
                    {formatCurrency(src.total)}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Cash Receipts:</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(src.cash)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Bank / Online:</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(src.bank)}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ExternalLink size={12} />}
                  onClick={() => { window.location.hash = src.route; }}
                >
                  Manage {src.name}
                </Button>
              </div>
            ))}
          </div>

          <Card title="Income Source Breakdown">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Revenue Stream</th>
                    <th style={{ textAlign: 'right' }}>Cash Collections</th>
                    <th style={{ textAlign: 'right' }}>Bank Credits</th>
                    <th style={{ textAlign: 'right' }}>Total Income</th>
                    <th style={{ textAlign: 'right' }}>Share of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeBreakdown.map(src => {
                    const share = balances.totalIncome > 0 ? ((src.total / balances.totalIncome) * 100).toFixed(1) : '0';
                    return (
                      <tr key={src.name}>
                        <td style={{ fontWeight: 600 }}>{src.name}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(src.cash)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(src.bank)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>
                          {formatCurrency(src.total)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{share}%</td>
                      </tr>
                    );
                  })}
                  <tr style={{ backgroundColor: '#FAFAFC', fontWeight: 700 }}>
                    <td>Total Income</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(balances.totalCashIncome)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(balances.totalBankIncome)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>{formatCurrency(balances.totalIncome)}</td>
                    <td style={{ textAlign: 'right' }}>100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: EXPENSE MANAGEMENT */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Expenses</span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
                {formatCurrency(balances.totalExpenses)}
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cash Expenses</span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {formatCurrency(balances.totalCashExpenses)}
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bank Expenses</span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {formatCurrency(balances.totalBankExpenses)}
              </div>
            </div>
          </div>

          <Card title="Expenses by Category">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expense Category</th>
                    <th style={{ textAlign: 'center' }}>Vouchers</th>
                    <th style={{ textAlign: 'right' }}>Paid in Cash</th>
                    <th style={{ textAlign: 'right' }}>Paid via Bank</th>
                    <th style={{ textAlign: 'right' }}>Total Expense</th>
                    <th style={{ textAlign: 'right' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
                        No expense records found.
                      </td>
                    </tr>
                  ) : (
                    expenseBreakdown.map(e => {
                      const share = balances.totalExpenses > 0 ? ((e.total / balances.totalExpenses) * 100).toFixed(1) : '0';
                      return (
                        <tr key={e.category}>
                          <td style={{ fontWeight: 600 }}>{e.category}</td>
                          <td style={{ textAlign: 'center' }}>{e.count}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(e.cash)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(e.bank)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>
                            {formatCurrency(e.total)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{share}%</td>
                        </tr>
                      );
                    })
                  )}
                  <tr style={{ backgroundColor: '#FAFAFC', fontWeight: 700 }}>
                    <td>Total Expenses</td>
                    <td style={{ textAlign: 'center' }}>{expenseBreakdown.reduce((sum, e) => sum + e.count, 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(balances.totalCashExpenses)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(balances.totalBankExpenses)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-danger)' }}>{formatCurrency(balances.totalExpenses)}</td>
                    <td style={{ textAlign: 'right' }}>100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Fund Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Record Cash ⇄ Bank Contra Transfer"
        maxWidth="500px"
      >
        <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {transferError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#FDF2F2', borderRadius: '6px', border: '1px solid #F8B4B4', color: 'var(--color-danger)', fontSize: '12px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{transferError}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Transfer Direction *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setTransferDirection('CashToBank')}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: transferDirection === 'CashToBank' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: transferDirection === 'CashToBank' ? 'var(--color-primary-light)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Cash → Bank Deposit
              </button>
              <button
                type="button"
                onClick={() => setTransferDirection('BankToCash')}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: transferDirection === 'BankToCash' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: transferDirection === 'BankToCash' ? 'var(--color-primary-light)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Bank → Cash Withdrawal
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFC', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Available {transferDirection === 'CashToBank' ? 'Cash Balance' : 'Bank Balance'}:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatCurrency(transferDirection === 'CashToBank' ? balances.currentCashBalance : balances.currentBankBalance)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Transfer Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={transferAmount}
                onChange={e => setTransferAmount(Number(e.target.value))}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Transfer Date *
              </label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Reference / Cheque / Slip No (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. CHQ-892103 or DEP-SLIP-4022"
              value={transferRef}
              onChange={e => setTransferRef(e.target.value)}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Description / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Daily tuition fee collection deposit"
              value={transferDesc}
              onChange={e => setTransferDesc(e.target.value)}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Authorized By
            </label>
            <input
              type="text"
              value={transferOfficer}
              onChange={e => setTransferOfficer(e.target.value)}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<CheckCircle size={14} />}>
              Confirm Transfer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction: ${selectedTxn.id}`}
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: '#FAFAFC', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Date:</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{formatDate(selectedTxn.date)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Category:</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{selectedTxn.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Type:</span>
                <Badge variant={selectedTxn.type === 'income' ? 'success' : selectedTxn.type === 'expense' ? 'danger' : 'neutral'}>
                  {selectedTxn.type.toUpperCase()}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Payment Mode:</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{selectedTxn.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Amount:</span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: selectedTxn.type === 'income' ? 'var(--color-success)' : selectedTxn.type === 'expense' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                  {formatCurrency(selectedTxn.amount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Reference:</span>
                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedTxn.referenceId || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Particulars:
              </span>
              <p style={{ fontSize: '13px', lineHeight: 1.5, padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', margin: 0 }}>
                {selectedTxn.particulars}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              {getOriginModuleLink(selectedTxn) && (
                <Button
                  variant="primary"
                  icon={<ExternalLink size={13} />}
                  onClick={() => {
                    const link = getOriginModuleLink(selectedTxn);
                    setSelectedTxn(null);
                    if (link) window.location.hash = link;
                  }}
                >
                  Open Origin Module
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedTxn(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
