import React, { useState, useMemo } from 'react';
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
import type { Student, PaymentMethod } from '../types';
import {
  Search,
  Printer,
  CheckCircle,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface ClassGroup {
  classKey: string;
  students: Student[];
  totalStudents: number;
  totalApplicable: number;
  totalPaid: number;
  totalPending: number;
  filteredStudents?: Student[];
}

export const SchoolFeeManagement: React.FC = () => {
  const {
    students,
    feePayments,
    concessions,
    recordSchoolFeePayment,
    applyStudentConcession
  } = useAppStore();

  // Tabs
  const [activeTab, setActiveTab] = useState<'collection' | 'details' | 'history' | 'concessions'>('collection');

  // Receipt Modal State
  const [printableReceipt, setPrintableReceipt] = useState<PrintableReceiptData | null>(null);

  // Fee Collection Modal Workflow (Minimal: 1. Select Student, 2. Select Month & Details, 3. Record & Receipt)
  const [isCollectFeeModalOpen, setIsCollectFeeModalOpen] = useState(false);
  const [collectModalStep, setCollectModalStep] = useState<1 | 2 | 3>(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['November']);
  const [customPayAmount, setCustomPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [latestReceipt, setLatestReceipt] = useState<PrintableReceiptData | null>(null);

  // Fee Details Filter
  const [detailsClassFilter, setDetailsClassFilter] = useState('All');
  const [detailsStatusFilter, setDetailsStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Pending'>('All');
  const [detailsSearch, setDetailsSearch] = useState('');

  // Payment History Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyMethodFilter, setHistoryMethodFilter] = useState('All');

  // Concession application modal / form
  const [concessionStudent, setConcessionStudent] = useState<Student | null>(null);
  const [selectedConcessionId, setSelectedConcessionId] = useState<string>('');

  // Pagination states
  const [detailsPage, setDetailsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [concessionPage, setConcessionPage] = useState(1);

  const academicYears = ['2026-2027', '2025-2026', '2024-2025'];
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026-2027');
  const monthsList = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

  // Overview metrics
  const overview = useMemo(() => {
    const totalStudents = students.length;
    let totalApplicable = 0;
    let totalCollected = 0;

    students.forEach(s => {
      const applicable = s.schoolFeeTotal || s.monthlyFee * 10;
      totalApplicable += applicable;
      totalCollected += (s.schoolFeePaid || 0);
    });

    const totalPending = Math.max(0, totalApplicable - totalCollected);
    const collectionRate = totalApplicable > 0 ? ((totalCollected / totalApplicable) * 100).toFixed(1) : '0';

    return {
      totalStudents,
      totalApplicable,
      totalCollected,
      totalPending,
      collectionRate
    };
  }, [students]);

  // Calculate month statuses for a student
  const getStudentMonthStatus = (student: Student) => {
    const paidInPayments = new Set<string>();
    feePayments
      .filter(p => p.studentId === student.id)
      .forEach(p => {
        if (p.months) {
          p.months.forEach(m => paidInPayments.add(m));
        }
      });

    const paidAmount = student.schoolFeePaid || 0;
    const monthlyRate = student.monthlyFee || 1500;
    const paidCount = Math.floor(paidAmount / monthlyRate);

    return monthsList.map((month, idx) => {
      const isPaid = paidInPayments.has(month) || idx < paidCount;
      return {
        month,
        status: isPaid ? ('Paid' as const) : ('Pending' as const)
      };
    });
  };

  // Group students by Class & Division for the Classes Table
  const classGroups = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.forEach(s => {
      const key = `${s.className} - ${s.division}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(s);
    });

    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });

    return sortedKeys.map(key => {
      const classStudents = map.get(key)!;
      let totalApplicable = 0;
      let totalPaid = 0;

      classStudents.forEach(s => {
        totalApplicable += s.schoolFeeTotal || s.monthlyFee * 10;
        totalPaid += s.schoolFeePaid || 0;
      });

      return {
        classKey: key,
        students: classStudents,
        totalStudents: classStudents.length,
        totalApplicable,
        totalPaid,
        totalPending: Math.max(0, totalApplicable - totalPaid)
      };
    });
  }, [students]);

  // Filter class groups based on search
  const filteredClassGroups: ClassGroup[] = useMemo(() => {
    if (!studentSearch.trim()) return classGroups;
    const q = studentSearch.toLowerCase();
    const result: ClassGroup[] = [];
    classGroups.forEach(group => {
      const matchesClass = group.classKey.toLowerCase().includes(q);
      const matchingStudents = group.students.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.parentPhone.toLowerCase().includes(q)
      );
      if (matchesClass || matchingStudents.length > 0) {
        result.push({
          ...group,
          filteredStudents: matchesClass ? group.students : matchingStudents
        });
      }
    });
    return result;
  }, [classGroups, studentSearch]);

  const isClassExpanded = (classKey: string) => {
    return studentSearch.trim() !== '' || expandedClasses.includes(classKey);
  };

  const toggleClass = (classKey: string) => {
    setExpandedClasses(prev =>
      prev.includes(classKey) ? prev.filter(k => k !== classKey) : [...prev, classKey]
    );
  };

  // Modal student search
  const filteredModalStudents = useMemo(() => {
    if (!modalSearch.trim()) return students;
    const q = modalSearch.toLowerCase();
    return students.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
    );
  }, [students, modalSearch]);

  // Handle student selection to advance to Step 2 in Modal
  const handleSelectStudentForPayment = (student: Student) => {
    setSelectedStudent(student);
    const statuses = getStudentMonthStatus(student);
    const pendingMonths = statuses.filter(m => m.status === 'Pending').map(m => m.month);
    const initialSelected = pendingMonths.length > 0 ? [pendingMonths[0]] : ['November'];
    setSelectedMonths(initialSelected);
    setCustomPayAmount(student.monthlyFee * initialSelected.length);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setTransactionRef('');
    setRemarks('');
    setCollectModalStep(2);
    setIsCollectFeeModalOpen(true);
  };

  // Open modal from top-right button (starts at Step 1: Select Student)
  const handleOpenCollectFeeModal = () => {
    setSelectedStudent(null);
    setModalSearch('');
    setCollectModalStep(1);
    setIsCollectFeeModalOpen(true);
  };

  // Close modal and reset state
  const handleCloseCollectModal = () => {
    setIsCollectFeeModalOpen(false);
    setSelectedStudent(null);
    setCollectModalStep(1);
    setModalSearch('');
  };

  // Toggle month selection in Step 2
  const handleToggleMonth = (month: string) => {
    if (!selectedStudent) return;
    const isSelected = selectedMonths.includes(month);
    let updated: string[];
    if (isSelected) {
      updated = selectedMonths.filter(m => m !== month);
    } else {
      updated = [...selectedMonths, month];
    }
    setSelectedMonths(updated);
    setCustomPayAmount(updated.length * selectedStudent.monthlyFee);
  };

  // Execute payment in step 2 -> move to step 3 in modal
  const handleConfirmPayment = () => {
    if (!selectedStudent || customPayAmount <= 0) return;

    const payment = recordSchoolFeePayment({
      studentId: selectedStudent.id,
      amount: customPayAmount,
      method: paymentMethod,
      months: selectedMonths,
      referenceNo: transactionRef,
      remarks: remarks || `Tuition fee for ${selectedMonths.join(', ')}`
    });

    const receiptData: PrintableReceiptData = {
      type: 'fee',
      receiptNumber: payment.receiptNumber,
      date: paymentDate || payment.date,
      title: 'School Tuition Fee Receipt',
      payeeOrStudent: `${payment.studentName} (Adm: ${payment.admissionNumber})`,
      subInfo: `${payment.className} - Div ${payment.division} • ${selectedMonths.join(', ')} • AY ${selectedAcademicYear}`,
      paymentMethod: payment.method,
      referenceNo: payment.referenceNo,
      items: [
        { label: `Tuition Fee (${selectedMonths.join(', ')})`, amount: payment.amount }
      ],
      totalAmount: payment.amount,
      remarks: payment.remarks
    };

    setLatestReceipt(receiptData);
    setCollectModalStep(3);
  };

  // Filtered Fee Details list
  const filteredFeeDetails = useMemo(() => {
    return students.filter(s => {
      const matchesClass = detailsClassFilter === 'All' || s.className === detailsClassFilter;
      const matchesSearch = !detailsSearch ||
        s.name.toLowerCase().includes(detailsSearch.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(detailsSearch.toLowerCase());
      const effectiveStatus = s.feeStatus || ((s.schoolFeePaid || 0) >= (s.schoolFeeTotal || s.monthlyFee * 10) ? 'Paid' : (s.schoolFeePaid || 0) > 0 ? 'Partial' : 'Pending');
      const matchesStatus = detailsStatusFilter === 'All' || effectiveStatus === detailsStatusFilter;
      return matchesClass && matchesSearch && matchesStatus;
    });
  }, [students, detailsClassFilter, detailsSearch, detailsStatusFilter]);

  // Filtered Payment History
  const filteredHistory = useMemo(() => {
    return feePayments.filter(p => {
      const matchesSearch = !historySearch ||
        p.studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.admissionNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.receiptNumber.toLowerCase().includes(historySearch.toLowerCase());
      const matchesMethod = historyMethodFilter === 'All' || p.method === historyMethodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [feePayments, historySearch, historyMethodFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>School Fee Management</h1>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EAEAF0', borderRadius: '8px' }}>
          {[
            { id: 'collection', label: 'Fee Collection' },
            { id: 'details', label: 'Fee Details' },
            { id: 'history', label: 'Payment History' },
            { id: 'concessions', label: 'Concessions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'collection' | 'details' | 'history' | 'concessions')}
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

      {/* A. Fee Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Students</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {overview.totalStudents}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Fees Applicable</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(overview.totalApplicable)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-success)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Collected</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            {formatCurrency(overview.totalCollected)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-danger)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Outstanding</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
            {formatCurrency(overview.totalPending)}
          </div>
        </div>
      </div>

      {/* TAB 1: FEE COLLECTION WORKFLOW */}
      {activeTab === 'collection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CLASSES TABLE WITH EXPANDABLE STUDENT ROWS */}
          <Card padding="0">
            {/* Header with Search Bar on left-end and Collect Fee button on right */}
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
              {/* Search Bar at Left-End */}
              <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
                <Search
                  size={16}
                  color="#777777"
                  style={{ position: 'absolute', left: '12px', top: '10px', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Search class, student name, admission no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    height: '36px',
                    fontSize: '13px',
                    borderRadius: '6px'
                  }}
                />
              </div>

              {/* Right Top Action: Collect Fee button */}
              <Button
                variant="primary"
                icon={<Plus size={15} />}
                onClick={handleOpenCollectFeeModal}
              >
                Collect Fee
              </Button>
            </div>

            {/* Classes Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '36px', textAlign: 'center' }}></th>
                    <th>Class & Division</th>
                    <th style={{ textAlign: 'center' }}>Total Students</th>
                    <th style={{ textAlign: 'right' }}>Total Applicable</th>
                    <th style={{ textAlign: 'right' }}>Total Collected</th>
                    <th style={{ textAlign: 'right' }}>Pending Due</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                        No classes or students found matching "{studentSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredClassGroups.map(group => {
                      const expanded = isClassExpanded(group.classKey);
                      const displayedStudents = group.filteredStudents || group.students;
                      return (
                        <React.Fragment key={group.classKey}>
                          {/* Class Row: Click to expand/collapse */}
                          <tr
                            onClick={() => toggleClass(group.classKey)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: expanded ? '#F7F7FD' : undefined,
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <td style={{ textAlign: 'center', color: '#5A54B4' }}>
                              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                {group.classKey}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Badge variant="purple">
                                {group.totalStudents} {group.totalStudents === 1 ? 'student' : 'students'}
                              </Badge>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 500 }}>
                              {formatCurrency(group.totalApplicable)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                              {formatCurrency(group.totalPaid)}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 600,
                                color: group.totalPending > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                              }}
                            >
                              {formatCurrency(group.totalPending)}
                            </td>
                          </tr>

                          {/* Expanded Students Sub-Table */}
                          {expanded && (
                            <tr style={{ backgroundColor: '#FBFCFE' }}>
                              <td colSpan={6} style={{ padding: '0 0 16px 0', borderBottom: '2px solid var(--color-border)' }}>
                                <div
                                  style={{
                                    margin: '6px 16px 8px 36px',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '8px',
                                    border: '1px solid #EAEAF0',
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                  }}
                                >
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#F4F4F8', borderBottom: '1px solid #EAEAF0' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#777777' }}>
                                          Adm No
                                        </th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#777777' }}>
                                          Student Name
                                        </th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#777777' }}>
                                          Parent Details
                                        </th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', color: '#777777' }}>
                                          Monthly Fee
                                        </th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', color: '#777777' }}>
                                          Pending Due
                                        </th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '11px', color: '#777777' }}>
                                          Action
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {displayedStudents.map(student => {
                                        const applicable = student.schoolFeeTotal || student.monthlyFee * 10;
                                        const pending = Math.max(0, applicable - (student.schoolFeePaid || 0));
                                        return (
                                          <tr
                                            key={student.id}
                                            style={{ borderBottom: '1px solid #F0F0F5' }}
                                          >
                                            {/* Admission Number WITHOUT bold */}
                                            <td
                                              style={{
                                                padding: '9px 12px',
                                                fontFamily: 'monospace',
                                                fontWeight: 400,
                                                color: 'var(--color-text-secondary)',
                                                fontSize: '12px'
                                              }}
                                            >
                                              {student.admissionNumber}
                                            </td>
                                            {/* Student Name IN BOLD */}
                                            <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                              {student.name}
                                            </td>
                                            <td style={{ padding: '9px 12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                              {student.parentName} ({student.parentPhone})
                                            </td>
                                            <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 500 }}>
                                              {formatCurrency(student.monthlyFee)}
                                            </td>
                                            <td
                                              style={{
                                                padding: '9px 12px',
                                                textAlign: 'right',
                                                fontWeight: 600,
                                                color: pending > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                                              }}
                                            >
                                              {formatCurrency(pending)}
                                            </td>
                                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                              <Button
                                                variant="primary"
                                                style={{ height: '28px', padding: '0 12px', fontSize: '11.5px' }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleSelectStudentForPayment(student);
                                                }}
                                              >
                                                Collect Fee
                                              </Button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: FEE DETAILS */}
      {activeTab === 'details' && (
        <Card padding="0">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>Student Fee Ledger Breakdown</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={detailsSearch}
                  onChange={e => {
                    setDetailsSearch(e.target.value);
                    setDetailsPage(1);
                  }}
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
                />
              </div>
              <select
                value={detailsClassFilter}
                onChange={e => {
                  setDetailsClassFilter(e.target.value);
                  setDetailsPage(1);
                }}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Classes</option>
                {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={detailsStatusFilter}
                onChange={e => {
                  setDetailsStatusFilter(e.target.value as 'All' | 'Paid' | 'Partial' | 'Pending');
                  setDetailsPage(1);
                }}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Adm No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th style={{ textAlign: 'right' }}>Monthly Rate</th>
                  <th style={{ textAlign: 'right' }}>Total Applicable</th>
                  <th style={{ textAlign: 'right' }}>Total Paid</th>
                  <th style={{ textAlign: 'right' }}>Pending Due</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeeDetails.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      No student records found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredFeeDetails.slice((detailsPage - 1) * 20, detailsPage * 20).map(student => {
                  const applicable = student.schoolFeeTotal || student.monthlyFee * 10;
                  const paid = student.schoolFeePaid || 0;
                  const pending = Math.max(0, applicable - paid);
                  return (
                    <tr key={student.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 400, color: 'var(--color-text-secondary)' }}>{student.admissionNumber}</td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td>{student.className}-{student.division}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(student.monthlyFee)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(applicable)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                        {formatCurrency(paid)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: pending > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                        {formatCurrency(pending)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={student.feeStatus === 'Paid' ? 'success' : student.feeStatus === 'Partial' ? 'warning' : 'danger'}>
                          {student.feeStatus}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Button
                          variant="secondary"
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
                          onClick={() => {
                            setActiveTab('collection');
                            handleSelectStudentForPayment(student);
                          }}
                        >
                          Collect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
          <Pagination
            currentPage={detailsPage}
            totalItems={filteredFeeDetails.length}
            pageSize={20}
            onPageChange={setDetailsPage}
            itemName="students"
          />
        </Card>
      )}

      {/* TAB 3: PAYMENT HISTORY */}
      {activeTab === 'history' && (
        <Card padding="0">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 className="section-heading" style={{ margin: 0 }}>School Fee Payment History</h2>
              <p className="text-secondary" style={{ marginTop: '2px' }}>Total {feePayments.length} receipts issued</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search receipt, student..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
                />
              </div>
              <select
                value={historyMethodFilter}
                onChange={e => setHistoryMethodFilter(e.target.value)}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Payment Modes</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Adm No</th>
                  <th>Class</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Print / View</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.slice((historyPage - 1) * 20, historyPage * 20).map(payment => (
                  <tr key={payment.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {payment.receiptNumber}
                    </td>
                    <td>{formatDate(payment.date)}</td>
                    <td style={{ fontWeight: 600 }}>{payment.studentName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{payment.admissionNumber}</td>
                    <td>{payment.className}-{payment.division}</td>
                    <td>{payment.method}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant="success">Completed</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant="secondary"
                        icon={<Printer size={13} />}
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        onClick={() => {
                          setPrintableReceipt({
                            type: 'fee',
                            receiptNumber: payment.receiptNumber,
                            date: payment.date,
                            title: 'School Tuition Fee Receipt',
                            payeeOrStudent: `${payment.studentName} (Adm: ${payment.admissionNumber})`,
                            subInfo: `Class: ${payment.className}-${payment.division} • Ref: ${payment.referenceNo || 'None'}`,
                            paymentMethod: payment.method,
                            referenceNo: payment.referenceNo,
                            items: [
                              { label: `Tuition Fee (${payment.months?.join(', ') || 'Tuition'})`, amount: payment.amount }
                            ],
                            totalAmount: payment.amount,
                            remarks: payment.remarks
                          });
                        }}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={historyPage}
            totalItems={filteredHistory.length}
            pageSize={20}
            onPageChange={setHistoryPage}
            itemName="receipts"
          />
        </Card>
      )}

      {/* TAB 4: CONCESSIONS */}
      {activeTab === 'concessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Fee Concessions & Scholarships">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              {concessions.map(conc => (
                <div key={conc.id} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FAFAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{conc.name}</div>
                    <Badge variant={conc.status === 'Active' ? 'purple' : 'neutral'}>{conc.status}</Badge>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#5A54B4', margin: '4px 0' }}>
                    {conc.discountType === 'Percentage' ? `${conc.discountValue}% Waiver` : `₹${conc.discountValue} Flat Discount`}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {conc.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Student Concession Assignments">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Adm No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Regular Monthly Fee</th>
                    <th>Assigned Concession</th>
                    <th style={{ textAlign: 'right' }}>Discount Value</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice((concessionPage - 1) * 20, concessionPage * 20).map(student => {
                    const activeConc = concessions.find(c => c.id === student.concessionId);
                    return (
                      <tr key={student.id}>
                        <td style={{ fontFamily: 'monospace' }}>{student.admissionNumber}</td>
                        <td style={{ fontWeight: 600 }}>{student.name}</td>
                        <td>{student.className}-{student.division}</td>
                        <td>{formatCurrency(student.monthlyFee)}</td>
                        <td>
                          {activeConc ? (
                            <Badge variant="purple">{activeConc.name}</Badge>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>None</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#5A54B4' }}>
                          {student.concessionAmount ? `₹${student.concessionAmount}/mo` : '₹0'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Button
                            variant="secondary"
                            style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                            onClick={() => {
                              setConcessionStudent(student);
                              setSelectedConcessionId(student.concessionId || '');
                            }}
                          >
                            Modify
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={concessionPage}
              totalItems={students.length}
              pageSize={20}
              onPageChange={setConcessionPage}
              itemName="students"
            />
          </Card>
        </div>
      )}

      {/* Concession Assignment Modal */}
      {concessionStudent && (
        <Modal
          isOpen={!!concessionStudent}
          onClose={() => setConcessionStudent(null)}
          title={`Assign Concession: ${concessionStudent.name}`}
          subtitle={`Class: ${concessionStudent.className} • Base Monthly Fee: ₹${concessionStudent.monthlyFee}`}
          maxWidth="480px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConcessionStudent(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  applyStudentConcession(concessionStudent.id, selectedConcessionId || null);
                  setConcessionStudent(null);
                }}
              >
                Save Concession
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Select Concession Rule</label>
            <select
              value={selectedConcessionId}
              onChange={e => setSelectedConcessionId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">No Concession (Standard Fee)</option>
              {concessions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.discountType === 'Percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              * Concessions reduce the applicable tuition fee for billing calculations and are never recorded as received payments.
            </p>
          </div>
        </Modal>
      )}

      {/* Fee Collection Workflow Modal */}
      {isCollectFeeModalOpen && (
        <Modal
          isOpen={isCollectFeeModalOpen}
          onClose={handleCloseCollectModal}
          title={
            collectModalStep === 1
              ? 'Select Student to Collect Fee'
              : collectModalStep === 2
                ? 'Fee Collection'
                : 'Payment Recorded'
          }
          subtitle={
            collectModalStep === 1
              ? undefined
              : collectModalStep === 2 && selectedStudent
                ? `${selectedStudent.name} (${selectedStudent.admissionNumber}) • ${selectedStudent.className.toLowerCase().startsWith('class') ? selectedStudent.className : `Class ${selectedStudent.className}`} - ${selectedStudent.division}`
                : latestReceipt
                  ? `Receipt #${latestReceipt.receiptNumber}`
                  : undefined
          }
          maxWidth={collectModalStep === 2 ? '640px' : collectModalStep === 1 ? '560px' : '480px'}
        >
          {/* STEP 1: MINIMAL STUDENT SELECTION */}
          {collectModalStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-secondary)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by student name, admission number, or class..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    height: '38px',
                    fontSize: '13px',
                    borderRadius: '6px'
                  }}
                />
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredModalStudents.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    No students found matching "{modalSearch}"
                  </div>
                ) : (
                  filteredModalStudents.slice(0, 50).map(st => {
                    const classText = st.className.toLowerCase().startsWith('class')
                      ? `${st.className} - ${st.division}`
                      : `Class ${st.className} - ${st.division}`;
                    return (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudentForPayment(st)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#F7F7FA';
                          e.currentTarget.style.borderColor = 'var(--color-primary-light, #C7C5F4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', fontSize: '12.5px', fontFamily: 'monospace' }}>
                            {st.admissionNumber}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '13.5px' }}>
                            {st.name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Badge variant="neutral">
                            {classText}
                          </Badge>
                          <ChevronRight size={16} color="var(--color-text-secondary)" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT MONTH & PAYMENT DETAILS */}
          {collectModalStep === 2 && selectedStudent && (() => {
            const applicable = selectedStudent.schoolFeeTotal || selectedStudent.monthlyFee * 10;
            const paid = selectedStudent.schoolFeePaid || 0;
            const pending = Math.max(0, applicable - paid);
            const monthStatuses = getStudentMonthStatus(selectedStudent);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Student Mini Summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#F8F8FC',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'monospace' }}>
                      {selectedStudent.admissionNumber}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {selectedStudent.name}
                    </span>
                    <Badge variant="neutral">
                      {selectedStudent.className.toLowerCase().startsWith('class') ? selectedStudent.className : `Class ${selectedStudent.className}`} - {selectedStudent.division}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span>Monthly: <strong>{formatCurrency(selectedStudent.monthlyFee)}</strong></span>
                    <span>Pending Due: <strong style={{ color: pending > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatCurrency(pending)}</strong></span>
                  </div>
                </div>

                {/* Month Selection */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>
                      Select Months to Credit
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        value={selectedAcademicYear}
                        onChange={e => setSelectedAcademicYear(e.target.value)}
                        style={{
                          height: '28px',
                          padding: '0 8px',
                          fontSize: '11.5px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--color-text-primary)',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {academicYears.map(yr => (
                          <option key={yr} value={yr}>
                            AY {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 10 Months Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {monthStatuses.map(item => {
                      const isPaid = item.status === 'Paid';
                      const isSelected = selectedMonths.includes(item.month);
                      return (
                        <div
                          key={item.month}
                          onClick={() => {
                            if (!isPaid) handleToggleMonth(item.month);
                          }}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '6px',
                            border: isPaid
                              ? '1px solid #D4EDDA'
                              : isSelected
                                ? '2px solid #5A54B4'
                                : '1px solid var(--color-border)',
                            backgroundColor: isPaid
                              ? '#F4FBF6'
                              : isSelected
                                ? '#F0EFFB'
                                : '#FFFFFF',
                            cursor: isPaid ? 'default' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            textAlign: 'center',
                            userSelect: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '11.5px', color: isPaid ? '#2E7D32' : isSelected ? '#5A54B4' : 'var(--color-text-primary)' }}>
                            {item.month}
                          </span>
                          {isPaid ? (
                            <span style={{ fontSize: '9.5px', color: '#2E7D32', fontWeight: 600 }}>
                              ✓ Paid
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '9.5px',
                                color: isSelected ? '#5A54B4' : '#D94B4B',
                                fontWeight: 600
                              }}
                            >
                              {isSelected ? 'Selected' : 'Pending'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amount & Payment Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Amount to Credit (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="50"
                        value={customPayAmount}
                        onChange={e => setCustomPayAmount(Number(e.target.value))}
                        style={{ width: '100%', fontSize: '15px', fontWeight: 700, height: '36px' }}
                      />
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                        {selectedMonths.length} month(s): {selectedMonths.join(', ') || 'None'}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Payment Method *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                        style={{ width: '100%', height: '36px', fontSize: '13px' }}
                      >
                        <option value="Cash">Cash at Counter</option>
                        <option value="Bank">Bank Transfer / NEFT</option>
                        <option value="UPI">UPI / QR Code</option>
                        <option value="Cheque">Bank Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={e => setPaymentDate(e.target.value)}
                        style={{ width: '100%', height: '36px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Reference / Cheque # (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UTR / UPI Ref"
                        value={transactionRef}
                        onChange={e => setTransactionRef(e.target.value)}
                        style={{ width: '100%', height: '36px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tuition fee"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      style={{ width: '100%', height: '34px' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '4px' }}>
                  <Button
                    variant="secondary"
                    onClick={() => setCollectModalStep(1)}
                  >
                    Change Student
                  </Button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={handleCloseCollectModal}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      icon={<CheckCircle size={15} />}
                      onClick={handleConfirmPayment}
                      disabled={customPayAmount <= 0}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 3: ANIMATED SUCCESS SCREEN & RECEIPT PREVIEW */}
          {collectModalStep === 3 && latestReceipt && (() => {
            const match = latestReceipt.payeeOrStudent.match(/^(.*?)(?:\s*\((?:Adm:\s*)?([^)]+)\))?$/);
            const studentName = match ? match[1]?.trim() : latestReceipt.payeeOrStudent;
            const admNo = match ? match[2]?.trim() : '';
            const cleanSubInfo = (latestReceipt.subInfo || '')
              .replace(/^Class:\s*/i, '')
              .replace(/Months:\s*/gi, '')
              .trim();

            return (
              <SuccessScreen
                title="Payment Successfully Recorded!"
                amount={latestReceipt.totalAmount}
                amountLabel="Total Credited"
                details={[
                  {
                    value: (
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary, #1A1A2E)' }}>
                          {studentName}
                        </span>
                        {admNo && (
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted, #8E8EA0)' }}>
                            {admNo}
                          </span>
                        )}
                      </div>
                    )
                  },
                  {
                    value: (
                      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary, #4A4A68)', lineHeight: 1.4 }}>
                        {cleanSubInfo}
                      </div>
                    )
                  },
                  {
                    value: (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary, #666677)' }}>
                        {latestReceipt.paymentMethod}
                      </div>
                    )
                  }
                ]}
                secondaryAction={{
                  label: 'Collect Another',
                  onClick: () => {
                    setCollectModalStep(1);
                    setSelectedStudent(null);
                  }
                }}
                primaryAction={{
                  label: 'Receipt',
                  icon: <Printer size={15} />,
                  onClick: () => setPrintableReceipt(latestReceipt)
                }}
              />
            );
          })()}
        </Modal>
      )}

      {/* Global Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!printableReceipt}
        onClose={() => setPrintableReceipt(null)}
        data={printableReceipt}
      />
    </div>
  );
};
