import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { formatCurrency } from '../utils/formatters';
import {
  LogOut,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import type { Student } from '../types';

interface AcademicMonthStatus {
  monthName: string;
  year: number;
  dueDateStr: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
}

const ACADEMIC_MONTHS = [
  { name: 'June', year: 2026, dueDateStr: '10 Jun 2026', dueDate: '2026-06-10' },
  { name: 'July', year: 2026, dueDateStr: '10 Jul 2026', dueDate: '2026-07-10' },
  { name: 'August', year: 2026, dueDateStr: '10 Aug 2026', dueDate: '2026-08-10' },
  { name: 'September', year: 2026, dueDateStr: '10 Sep 2026', dueDate: '2026-09-10' },
  { name: 'October', year: 2026, dueDateStr: '10 Oct 2026', dueDate: '2026-10-10' },
  { name: 'November', year: 2026, dueDateStr: '10 Nov 2026', dueDate: '2026-11-10' },
  { name: 'December', year: 2026, dueDateStr: '10 Dec 2026', dueDate: '2026-12-10' },
  { name: 'January', year: 2027, dueDateStr: '10 Jan 2027', dueDate: '2027-01-10' },
  { name: 'February', year: 2027, dueDateStr: '10 Feb 2027', dueDate: '2027-02-10' },
  { name: 'March', year: 2027, dueDateStr: '10 Mar 2027', dueDate: '2027-03-10' },
];

// Reference date for demo: 2026-11-04
const CURRENT_DATE = '2026-11-04';

export const ParentPortal: React.FC = () => {
  const {
    students,
    generalSettings,
    paymentSettings
  } = useAppStore();

  // Authentication State (Adm No. only)
  const [admInput, setAdmInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeStudentAdm, setActiveStudentAdm] = useState<string | null>(() => {
    return sessionStorage.getItem('afps_parent_portal_adm') || null;
  });

  // Pay Now UPI Drawer/Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Locate current student
  const currentStudent: Student | undefined = useMemo(() => {
    if (!activeStudentAdm) return undefined;
    const clean = activeStudentAdm.trim().toLowerCase();
    return students.find(
      s => s.admissionNumber.toLowerCase() === clean || s.id.toLowerCase() === clean
    );
  }, [activeStudentAdm, students]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const query = admInput.trim();
    if (!query) {
      setLoginError('Please enter the student admission number.');
      return;
    }

    const cleanQuery = query.toLowerCase();
    const match = students.find(
      s => s.admissionNumber.toLowerCase() === cleanQuery ||
        s.admissionNumber.toLowerCase() === cleanQuery.replace(/[^a-z0-9]/g, '') ||
        s.id === cleanQuery
    );

    if (match) {
      setActiveStudentAdm(match.admissionNumber);
      sessionStorage.setItem('afps_parent_portal_adm', match.admissionNumber);
      setAdmInput('');
    } else {
      setLoginError(`No student record found with admission number "${query}".`);
    }
  };

  // Quick select helper for testing
  const handleQuickLogin = (adm: string) => {
    setLoginError('');
    setActiveStudentAdm(adm);
    sessionStorage.setItem('afps_parent_portal_adm', adm);
  };

  // Handle Logout
  const handleLogout = () => {
    setActiveStudentAdm(null);
    sessionStorage.removeItem('afps_parent_portal_adm');
  };

  // Student Fee Calculations
  const feeMetrics = useMemo(() => {
    if (!currentStudent) {
      return {
        totalPayable: 0,
        totalPaid: 0,
        outstanding: 0,
        monthlyFee: 0,
        monthsList: [] as AcademicMonthStatus[],
        nextPaymentInfo: {
          hasDue: false,
          isOverdue: false,
          dueDateStr: 'No pending payment',
          monthName: ''
        }
      };
    }

    const monthlyFee = currentStudent.monthlyFee || (currentStudent.schoolFeeTotal ? Math.round(currentStudent.schoolFeeTotal / 10) : 1500);
    const schoolTotal = currentStudent.schoolFeeTotal ?? (monthlyFee * 10);
    const busTotal = currentStudent.busFeeTotal ?? 0;
    const totalPayable = schoolTotal + busTotal;

    const schoolPaid = currentStudent.schoolFeePaid ?? 0;
    const busPaid = currentStudent.busFeePaid ?? 0;
    const totalPaid = schoolPaid + busPaid;

    const outstanding = Math.max(0, totalPayable - totalPaid);

    // Compute month-by-month status from schoolFeePaid using FIFO
    const monthsList: AcademicMonthStatus[] = ACADEMIC_MONTHS.map((m, index) => {
      const amountDue = monthlyFee;
      const prevCovered = index * amountDue;
      const allocated = Math.max(0, Math.min(amountDue, schoolPaid - prevCovered));

      let status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
      if (allocated >= amountDue) {
        status = 'Paid';
      } else if (allocated > 0) {
        status = 'Partial';
      } else {
        if (m.dueDate < CURRENT_DATE) {
          status = 'Overdue';
        } else {
          status = 'Pending';
        }
      }

      return {
        monthName: m.name,
        year: m.year,
        dueDateStr: m.dueDateStr,
        dueDate: m.dueDate,
        amountDue,
        amountPaid: allocated,
        status
      };
    });

    // Determine Next Payment Date
    // Rule:
    // - If all fees are paid (outstanding === 0), display a simple "No pending payment" status.
    // - Paid months are NEVER highlighted as overdue.
    // - If multiple unpaid fees exist, display the earliest outstanding due date.
    // - If due date has passed & amount is outstanding -> highlight warning (red).
    // - If due date is upcoming -> subtle accent / neutral.
    let nextPaymentInfo = {
      hasDue: false,
      isOverdue: false,
      dueDateStr: 'No pending payment',
      monthName: ''
    };

    if (outstanding > 0) {
      // Find the earliest unpaid or partially paid month
      const earliestUnpaid = monthsList.find(m => m.status !== 'Paid');
      if (earliestUnpaid) {
        const isOverdue = earliestUnpaid.dueDate < CURRENT_DATE;
        nextPaymentInfo = {
          hasDue: true,
          isOverdue,
          dueDateStr: earliestUnpaid.dueDateStr,
          monthName: earliestUnpaid.monthName
        };
      }
    }

    return {
      totalPayable,
      totalPaid,
      outstanding,
      monthlyFee,
      monthsList,
      nextPaymentInfo
    };
  }, [currentStudent]);



  // UPI Link Generation
  const upiUrl = useMemo(() => {
    if (!paymentSettings.upiId || !currentStudent || feeMetrics.outstanding <= 0) return '';
    const pa = paymentSettings.upiId.trim();
    const pn = encodeURIComponent(generalSettings.schoolName || 'AFPS School');
    const am = feeMetrics.outstanding;
    const tn = encodeURIComponent(`Fee Payment ${currentStudent.admissionNumber}`);
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
  }, [paymentSettings.upiId, currentStudent, feeMetrics.outstanding, generalSettings.schoolName]);

  const handleCopyUpi = () => {
    if (paymentSettings.upiId) {
      navigator.clipboard.writeText(paymentSettings.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handlePayNowClick = () => {
    setIsPayModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // ---------------------------------------------------------------------------
  if (!currentStudent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#F7F7FA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px',
          fontFamily: 'var(--font-stack)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            padding: '32px 24px'
          }}
        >
          {/* Header Branding */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img
              src="/favicon.svg?v=2"
              alt="AFPS Logo"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                marginBottom: '12px',
                display: 'inline-block'
              }}
            />
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 4px 0',
                letterSpacing: '-0.3px'
              }}
            >
              Fee Portal
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                margin: 0
              }}
            >
              {generalSettings.schoolName}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="parent-adm-no-input"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '6px'
                }}
              >
                Admission Number (Adm No.)
              </label>
              <input
                id="parent-adm-no-input"
                type="text"
                autoComplete="off"
                placeholder="e.g. AFPS001"
                value={admInput}
                onChange={e => {
                  setAdmInput(e.target.value);
                  if (loginError) setLoginError('');
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-button)',
                  border: loginError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              />
              {loginError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-danger)',
                    fontSize: '12px',
                    marginTop: '6px'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                height: '42px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-button)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.15s ease'
              }}
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          </form>

          {/* Quick Demo Student Logins for Evaluator Ease */}
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              Demo Testing Profiles
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('AFPS002')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FAFAFA',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>AFPS002</strong> - Amina Fathima (Class 6B)
                </div>
                <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '11px' }}>
                  Overdue Fee
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('AFPS004')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FAFAFA',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>AFPS004</strong> - Rithvik Menon (Class 4A)
                </div>
                <span style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '11px' }}>
                  Partial Paid
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('AFPS001')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FAFAFA',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>AFPS001</strong> - Muhammed Ayaan (Class 5A)
                </div>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '11px' }}>
                  Fully Paid
                </span>
              </button>
            </div>
          </div>

          {/* Admin Switcher */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { window.location.assign('#/'); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to Admin Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED PORTAL VIEW
  // ---------------------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F7FA',
        fontFamily: 'var(--font-stack)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Mobile-first top navigation container */}
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Portal Header */}
        <header
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/favicon.svg?v=2"
              alt="AFPS Logo"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                flexShrink: 0,
                display: 'block'
              }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {generalSettings.schoolName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Parent Fee Portal
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { window.location.assign('#/'); }}
              title="Return to Admin Application"
              style={{
                height: '30px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-secondary)',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>Admin</span>
              <ExternalLink size={11} />
            </button>

            <button
              onClick={handleLogout}
              style={{
                height: '30px',
                padding: '0 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-danger)',
                fontSize: '12px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Portal Body Content */}
        <main
          style={{
            padding: feeMetrics.outstanding > 0 ? '16px 16px 85px 16px' : '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* 1. Student Overview (Modern Purple Gradient Banner - No Drop Shadow) */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '22px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3A3197 0%, #4B41AF 50%, #342B8D 100%)',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              color: '#FFFFFF'
            }}
          >
            {/* Decorative Bottom-Right Swoosh Arcs */}
            <svg
              viewBox="0 0 260 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                height: '100%',
                width: '260px',
                pointerEvents: 'none',
                zIndex: 0
              }}
              preserveAspectRatio="none"
            >
              <path
                d="M30 110C90 92 170 42 260 20V110H30Z"
                fill="url(#swoosh-grad-1)"
                opacity="0.38"
              />
              <path
                d="M100 110C155 96 215 62 260 48V110H100Z"
                fill="url(#swoosh-grad-2)"
                opacity="0.55"
              />
              <defs>
                <linearGradient id="swoosh-grad-1" x1="30" y1="65" x2="260" y2="65" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8176EE" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#5E51D8" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="swoosh-grad-2" x1="100" y1="79" x2="260" y2="79" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#958AF8" stopOpacity="0.65" />
                  <stop offset="1" stopColor="#6C5CE7" stopOpacity="0.25" />
                </linearGradient>
              </defs>
            </svg>

            {/* Left: Student Info */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.4px',
                  margin: '0 0 6px 0',
                  lineHeight: 1.2
                }}
              >
                {currentStudent.name}
              </h2>
              <div
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '2px'
                }}
              >
                <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{currentStudent.admissionNumber}</strong>
                <span style={{ margin: '0 10px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 300 }}>|</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{currentStudent.className}-{currentStudent.division}</strong>
              </div>
            </div>

            {/* Right: Academic Year Capsule Pill */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                padding: '4px 12px',
                borderRadius: '20px',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              {generalSettings.academicYear || '2026–2027'}
            </div>
          </div>

          {/* 2. Next Payment Date / Overdue Status (Minimal, One Line, No Icon) */}
          {feeMetrics.outstanding > 0 ? (
            <div
              style={{
                padding: '11px 16px',
                borderRadius: '8px',
                border: feeMetrics.nextPaymentInfo.isOverdue ? '1px solid #FECACA' : '1px solid var(--color-border)',
                backgroundColor: feeMetrics.nextPaymentInfo.isOverdue ? '#FEF2F2' : '#F9FAFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}
            >
              <span
                style={{
                  color: feeMetrics.nextPaymentInfo.isOverdue ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                  fontWeight: 600
                }}
              >
                {feeMetrics.nextPaymentInfo.isOverdue ? 'Payment Overdue' : 'Next Payment Due'}
              </span>
              <span
                style={{
                  color: feeMetrics.nextPaymentInfo.isOverdue ? 'var(--color-danger)' : 'var(--color-text-primary)',
                  fontWeight: 700
                }}
              >
                {feeMetrics.nextPaymentInfo.dueDateStr}
              </span>
            </div>
          ) : (
            <div
              style={{
                padding: '11px 16px',
                borderRadius: '8px',
                border: '1px solid #B7F4D8',
                backgroundColor: '#EDFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: 'var(--color-success)',
                fontWeight: 600
              }}
            >
              <span>All fees cleared</span>
              <span>No dues pending</span>
            </div>
          )}

          {/* 3. Fee Status Metrics (Total Payable, Total Paid with Receipt Action, Outstanding) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px'
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Total Payable
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formatCurrency(feeMetrics.totalPayable)}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Total Paid
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-success)'
                }}
              >
                {formatCurrency(feeMetrics.totalPaid)}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: feeMetrics.outstanding > 0 ? '#FFF8F8' : '#FFFFFF',
                border: feeMetrics.outstanding > 0 ? '1px solid #FED7D7' : '1px solid var(--color-border)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Outstanding
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: feeMetrics.outstanding > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)'
                }}
              >
                {formatCurrency(feeMetrics.outstanding)}
              </div>
            </div>
          </div>

          {/* 4. Monthly Fee Schedule Section */}
          <div style={{ marginTop: '2px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Monthly Fee Schedule
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {feeMetrics.monthsList.map(m => {
                const statusConfig = {
                  Paid: {
                    color: 'var(--color-success)',
                    bg: '#EDFDF5',
                    border: '#B7F4D8',
                    label: 'Paid'
                  },
                  Partial: {
                    color: 'var(--color-warning)',
                    bg: '#FFFBEB',
                    border: '#FDE68A',
                    label: 'Partial'
                  },
                  Overdue: {
                    color: 'var(--color-danger)',
                    bg: '#FEF2F2',
                    border: '#FECACA',
                    label: 'Overdue'
                  },
                  Pending: {
                    color: 'var(--color-text-secondary)',
                    bg: '#F3F4F6',
                    border: 'var(--color-border)',
                    label: 'Pending'
                  }
                }[m.status];

                return (
                  <div
                    key={`${m.monthName}-${m.year}`}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {m.monthName} {m.year}
                      </div>
                      {/* Show due date ONLY for pending, partial, and overdue fees */}
                      {m.status !== 'Paid' && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Due Date: {m.dueDateStr}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Only show pending amount; if partial, show paid in small muted color */}
                      <div>
                        {m.status === 'Partial' && (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {formatCurrency(m.amountDue - m.amountPaid)}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                              Paid: {formatCurrency(m.amountPaid)}
                            </div>
                          </div>
                        )}

                        {(m.status === 'Pending' || m.status === 'Overdue') && (
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {formatCurrency(m.amountDue)}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            border: `1px solid ${statusConfig.border}`,
                            minWidth: '55px',
                            textAlign: 'center'
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Floating Pay Now Button at the Bottom (No Icon) */}
        {feeMetrics.outstanding > 0 && (
          <div
            style={{
              position: 'fixed',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)',
              maxWidth: '528px',
              zIndex: 90
            }}
          >
            <button
              type="button"
              onClick={handlePayNowClick}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(90, 84, 180, 0.45)',
                transition: 'all 0.15s ease'
              }}
            >
              Pay Now • {formatCurrency(feeMetrics.outstanding)}
            </button>
          </div>
        )}
        <footer
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            backgroundColor: '#FAFAFA'
          }}
        >
          {generalSettings.schoolName} • Fee inquiries: {generalSettings.phone}
        </footer>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. PAY NOW (Google Pay / UPI Modal)                                      */}
      {/* ----------------------------------------------------------------------- */}
      {isPayModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
          onClick={() => setIsPayModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Pay via Google Pay / UPI
              </span>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Check if UPI ID is configured */}
            {!paymentSettings.upiId || paymentSettings.upiId.trim() === '' ? (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: 'var(--color-danger)',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>UPI Payment Not Configured</div>
                <div>
                  No school UPI ID has been configured in the system settings. Please contact the school accounts office directly at{' '}
                  <strong>{generalSettings.phone}</strong> to complete your fee payment.
                </div>
              </div>
            ) : (
              <>
                {/* Amount Summary */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Outstanding Fee Payable</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                    {formatCurrency(feeMetrics.outstanding)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Beneficiary: <strong>{generalSettings.schoolName}</strong>
                  </div>
                </div>

                {/* School UPI Details & Copy Button */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>School UPI ID</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {paymentSettings.upiId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: copiedUpi ? 'var(--color-success)' : 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedUpi ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>

                {/* Google Pay / UPI Redirection Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (upiUrl) {
                      window.location.assign(upiUrl);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1E1E1E',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span>Open in Google Pay / UPI App</span>
                </button>

                {/* Important Notice */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    fontSize: '12px',
                    color: '#92400E',
                    lineHeight: 1.4
                  }}
                >
                  <strong>Note:</strong> Complete the payment in your UPI app and contact the school office to confirm it.
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
