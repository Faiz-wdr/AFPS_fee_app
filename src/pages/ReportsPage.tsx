import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Download,
  Printer,
  Calendar,
  GraduationCap,
  Bus,
  ShoppingBag,
  FileText,
  Wallet
} from 'lucide-react';

type ReportCategory = 'schoolFee' | 'busFee' | 'storeSales' | 'expense' | 'finance';

interface ReportDefinition {
  id: string;
  name: string;
  category: ReportCategory;
}

const REPORT_DEFINITIONS: ReportDefinition[] = [
  // School Fee
  { id: 'sf_daily', name: 'Daily Fee Collection', category: 'schoolFee' },
  { id: 'sf_monthly', name: 'Monthly Fee Collection', category: 'schoolFee' },
  { id: 'sf_class', name: 'Class-Wise Collection', category: 'schoolFee' },
  { id: 'sf_student', name: 'Student Fee Statement', category: 'schoolFee' },
  { id: 'sf_pending', name: 'Pending Tuition Dues', category: 'schoolFee' },
  { id: 'sf_concession', name: 'Fee Concessions & Waivers', category: 'schoolFee' },

  // Bus Fee
  { id: 'bus_daily', name: 'Daily Bus Fee Collection', category: 'busFee' },
  { id: 'bus_monthly', name: 'Monthly Bus Fee Collection', category: 'busFee' },
  { id: 'bus_route', name: 'Route-Wise Bus Collection', category: 'busFee' },
  { id: 'bus_student', name: 'Student Bus Statement', category: 'busFee' },
  { id: 'bus_pending', name: 'Pending Bus Dues', category: 'busFee' },

  // Store Sales
  { id: 'store_daily', name: 'Daily Store Sales', category: 'storeSales' },
  { id: 'store_monthly', name: 'Monthly Store Sales', category: 'storeSales' },
  { id: 'store_product', name: 'Product-Wise Sales', category: 'storeSales' },
  { id: 'store_mode', name: 'Payment Mode Breakdown', category: 'storeSales' },

  // Expense
  { id: 'exp_daily', name: 'Daily Expense Ledger', category: 'expense' },
  { id: 'exp_monthly', name: 'Monthly Expense Report', category: 'expense' },
  { id: 'exp_category', name: 'Category-Wise Expenses', category: 'expense' },
  { id: 'exp_mode', name: 'Cash vs Bank Expenses', category: 'expense' },

  // Finance
  { id: 'fin_statement', name: 'Income & Expense Statement', category: 'finance' },
  { id: 'fin_cashbook', name: 'Cash Book', category: 'finance' },
  { id: 'fin_bankbook', name: 'Bank Book', category: 'finance' },
  { id: 'fin_summary', name: 'Overall Financial Summary', category: 'finance' },
];

const classesList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const ReportsPage: React.FC = () => {
  const {
    students,
    feePayments,
    busPayments,
    busRoutes,
    sales,
    products,
    vouchers,
    transfers,
    concessions,
    generalSettings,
    paymentSettings
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<ReportCategory>('schoolFee');
  const [selectedReportId, setSelectedReportId] = useState<string>('sf_daily');

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [routeFilter, setRouteFilter] = useState<string>('All');
  const [reportPage, setReportPage] = useState(1);

  const categoryReports = useMemo(() => {
    return REPORT_DEFINITIONS.filter(r => r.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (cat: ReportCategory) => {
    setActiveCategory(cat);
    const firstReport = REPORT_DEFINITIONS.find(r => r.category === cat);
    if (firstReport) {
      setSelectedReportId(firstReport.id);
    }
  };

  // Computation of the active report data
  const reportData = useMemo(() => {
    const isWithinDate = (dateStr: string) => {
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    };

    switch (selectedReportId) {
      // 1. School Fee - Daily
      case 'sf_daily': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        feePayments.filter(fp => isWithinDate(fp.date)).forEach(fp => {
          if (!map[fp.date]) map[fp.date] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[fp.date].count += 1;
          if (fp.method === 'Cash') map[fp.date].cash += fp.amount;
          else map[fp.date].bank += fp.amount;
          map[fp.date].total += fp.amount;
        });

        const rows = Object.entries(map).map(([date, d]) => ({
          col1: formatDate(date),
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Daily School Fee Collection',
          headers: ['Date', 'Transactions', 'Cash Amount', 'Bank / Online Amount', 'Total Collected'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Collections',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Total Transactions',
          kpiValue2: rows.reduce((s, r) => s + parseInt(r.col2, 10), 0).toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 2. School Fee - Monthly
      case 'sf_monthly': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        feePayments.filter(fp => isWithinDate(fp.date)).forEach(fp => {
          const monthYear = fp.date.slice(0, 7); // YYYY-MM
          if (!map[monthYear]) map[monthYear] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[monthYear].count += 1;
          if (fp.method === 'Cash') map[monthYear].cash += fp.amount;
          else map[monthYear].bank += fp.amount;
          map[monthYear].total += fp.amount;
        });

        const rows = Object.entries(map).map(([my, d]) => ({
          col1: my,
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Monthly School Fee Collection',
          headers: ['Billing Month', 'Receipts', 'Cash Receipts', 'Bank Credits', 'Total Collection'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Collected',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Total Months',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 3. School Fee - Class-wise
      case 'sf_class': {
        const map: Record<string, { studentCount: number; applicable: number; collected: number; pending: number }> = {};
        classesList.forEach(cls => {
          map[cls] = { studentCount: 0, applicable: 0, collected: 0, pending: 0 };
        });

        students.forEach(st => {
          if (!map[st.className]) {
            map[st.className] = { studentCount: 0, applicable: 0, collected: 0, pending: 0 };
          }
          const applicable = st.schoolFeeTotal || st.monthlyFee * 10;
          const paid = st.schoolFeePaid || 0;
          map[st.className].studentCount += 1;
          map[st.className].applicable += applicable;
          map[st.className].collected += paid;
          map[st.className].pending += Math.max(0, applicable - paid);
        });

        const rows = Object.entries(map).map(([cls, d]) => ({
          col1: cls,
          col2: d.studentCount.toString(),
          col3: formatCurrency(d.applicable),
          col4: formatCurrency(d.collected),
          col5: formatCurrency(d.pending),
          rawTotal: d.collected
        }));

        const totalCollected = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Class-Wise Tuition Fee Statement',
          headers: ['Class Grade', 'Enrolled Students', 'Total Applicable', 'Total Collected', 'Total Pending'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Collected',
          kpiValue1: formatCurrency(totalCollected),
          kpiLabel2: 'Classes Tracked',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalCollected)
        };
      }

      // 4. School Fee - Student-wise
      case 'sf_student': {
        const filtered = students.filter(s => classFilter === 'All' || s.className === classFilter);
        const rows = filtered.map(s => {
          const applicable = s.schoolFeeTotal || s.monthlyFee * 10;
          const paid = s.schoolFeePaid || 0;
          const pending = Math.max(0, applicable - paid);
          return {
            col1: `${s.name} (${s.admissionNumber})`,
            col2: `${s.className}-${s.division}`,
            col3: formatCurrency(s.monthlyFee),
            col4: formatCurrency(paid),
            col5: formatCurrency(pending),
            rawTotal: paid
          };
        });

        const totalPaid = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Student Tuition Fee Statement',
          headers: ['Student Name (Adm)', 'Class', 'Monthly Tariff', 'Total Paid', 'Balance Due'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Paid',
          kpiValue1: formatCurrency(totalPaid),
          kpiLabel2: 'Student Count',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalPaid)
        };
      }

      // 5. School Fee - Pending
      case 'sf_pending': {
        const filtered = students.filter(s => {
          const applicable = s.schoolFeeTotal || s.monthlyFee * 10;
          const paid = s.schoolFeePaid || 0;
          const pending = Math.max(0, applicable - paid);
          return pending > 0 && (classFilter === 'All' || s.className === classFilter);
        });

        const rows = filtered.map(s => {
          const applicable = s.schoolFeeTotal || s.monthlyFee * 10;
          const paid = s.schoolFeePaid || 0;
          const pending = Math.max(0, applicable - paid);
          return {
            col1: s.name,
            col2: s.admissionNumber,
            col3: `${s.className}-${s.division}`,
            col4: s.parentPhone,
            col5: formatCurrency(pending),
            rawTotal: pending
          };
        });

        const totalPending = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Pending Tuition Dues Report',
          headers: ['Student Name', 'Admission No', 'Class', 'Parent Phone', 'Pending Due'],
          aligns: ['left', 'center', 'center', 'left', 'right'],
          rows,
          kpiLabel1: 'Total Pending Dues',
          kpiValue1: formatCurrency(totalPending),
          kpiLabel2: 'Defaulter Students',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalPending)
        };
      }

      // 6. School Fee - Concession
      case 'sf_concession': {
        const filtered = students.filter(s => s.concessionId);
        const rows = filtered.map(s => {
          const conc = concessions.find(c => c.id === s.concessionId);
          const waiverAmount = s.concessionAmount || 0;
          const finalPayable = Math.max(0, s.monthlyFee - waiverAmount);
          return {
            col1: s.name,
            col2: `${s.className}-${s.division}`,
            col3: conc ? conc.name : 'Custom Concession',
            col4: formatCurrency(waiverAmount),
            col5: formatCurrency(finalPayable),
            rawTotal: waiverAmount
          };
        });

        const totalWaivers = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Student Fee Concessions & Waivers',
          headers: ['Student Name', 'Class', 'Concession Scheme', 'Monthly Waiver', 'Net Payable'],
          aligns: ['left', 'center', 'left', 'right', 'right'],
          rows,
          kpiLabel1: 'Monthly Waiver Relief',
          kpiValue1: formatCurrency(totalWaivers),
          kpiLabel2: 'Beneficiary Students',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalWaivers)
        };
      }

      // 7. Bus Fee - Daily
      case 'bus_daily': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        busPayments.filter(bp => isWithinDate(bp.date)).forEach(bp => {
          if (!map[bp.date]) map[bp.date] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[bp.date].count += 1;
          if (bp.method === 'Cash') map[bp.date].cash += bp.amount;
          else map[bp.date].bank += bp.amount;
          map[bp.date].total += bp.amount;
        });

        const rows = Object.entries(map).map(([date, d]) => ({
          col1: formatDate(date),
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Daily Bus Fee Collection',
          headers: ['Date', 'Transactions', 'Cash Amount', 'Bank / Online Amount', 'Total Collected'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Bus Collection',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Transactions',
          kpiValue2: rows.reduce((s, r) => s + parseInt(r.col2, 10), 0).toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 8. Bus Fee - Monthly
      case 'bus_monthly': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        busPayments.filter(bp => isWithinDate(bp.date)).forEach(bp => {
          const my = bp.date.slice(0, 7);
          if (!map[my]) map[my] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[my].count += 1;
          if (bp.method === 'Cash') map[my].cash += bp.amount;
          else map[my].bank += bp.amount;
          map[my].total += bp.amount;
        });

        const rows = Object.entries(map).map(([my, d]) => ({
          col1: my,
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Monthly Bus Fee Collection',
          headers: ['Month', 'Transactions', 'Cash Receipts', 'Bank Credits', 'Total Collection'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Collected',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Total Months',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 9. Bus Fee - Route-wise
      case 'bus_route': {
        const rows = busRoutes.map(route => {
          const payments = busPayments.filter(bp => bp.routeId === route.id && isWithinDate(bp.date));
          const collected = payments.reduce((s, p) => s + p.amount, 0);
          return {
            col1: route.routeNumber,
            col2: route.routeName,
            col3: route.assignedStudents.toString(),
            col4: formatCurrency(route.monthlyFee),
            col5: formatCurrency(collected),
            rawTotal: collected
          };
        });

        const totalCollected = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Route-Wise Bus Collection Report',
          headers: ['Route ID', 'Route Name', 'Assigned Students', 'Monthly Tariff', 'Total Collected'],
          aligns: ['left', 'left', 'center', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Collected',
          kpiValue1: formatCurrency(totalCollected),
          kpiLabel2: 'Total Routes',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalCollected)
        };
      }

      // 10. Bus Fee - Student-wise
      case 'bus_student': {
        const filtered = students.filter(s => {
          if (!s.busRoute) return false;
          if (routeFilter === 'All') return true;
          const rObj = busRoutes.find(r => r.routeNumber === s.busRoute || r.routeName === s.busRoute);
          return s.busRoute === routeFilter || (rObj && (rObj.routeNumber === routeFilter || rObj.routeName === routeFilter));
        });
        const rows = filtered.map(s => {
          const applicable = s.busFeeTotal || 6000;
          const paid = s.busFeePaid || 0;
          const pending = Math.max(0, applicable - paid);
          const rObj = busRoutes.find(r => r.routeNumber === s.busRoute || r.routeName === s.busRoute);
          return {
            col1: s.name,
            col2: `${s.className}-${s.division}`,
            col3: rObj ? rObj.routeName : (s.busRoute || 'None'),
            col4: formatCurrency(paid),
            col5: formatCurrency(pending),
            rawTotal: paid
          };
        });

        const totalPaid = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Student Bus Conveyance Statement',
          headers: ['Student Name', 'Class', 'Assigned Route', 'Bus Fee Paid', 'Bus Fee Pending'],
          aligns: ['left', 'center', 'left', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Paid',
          kpiValue1: formatCurrency(totalPaid),
          kpiLabel2: 'Bus Students',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalPaid)
        };
      }

      // 11. Bus Fee - Pending
      case 'bus_pending': {
        const filtered = students.filter(s => {
          if (!s.busRoute) return false;
          const applicable = s.busFeeTotal || 6000;
          const paid = s.busFeePaid || 0;
          if (applicable - paid <= 0) return false;
          if (routeFilter === 'All') return true;
          const rObj = busRoutes.find(r => r.routeNumber === s.busRoute || r.routeName === s.busRoute);
          return s.busRoute === routeFilter || (rObj && (rObj.routeNumber === routeFilter || rObj.routeName === routeFilter));
        });

        const rows = filtered.map(s => {
          const applicable = s.busFeeTotal || 6000;
          const paid = s.busFeePaid || 0;
          const pending = Math.max(0, applicable - paid);
          const rObj = busRoutes.find(r => r.routeNumber === s.busRoute || r.routeName === s.busRoute);
          return {
            col1: s.name,
            col2: s.admissionNumber,
            col3: rObj ? rObj.routeName : (s.busRoute || ''),
            col4: s.parentPhone,
            col5: formatCurrency(pending),
            rawTotal: pending
          };
        });

        const totalPending = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Pending Bus Dues Report',
          headers: ['Student Name', 'Admission No', 'Bus Route', 'Parent Phone', 'Bus Due Amount'],
          aligns: ['left', 'center', 'left', 'left', 'right'],
          rows,
          kpiLabel1: 'Total Bus Pending',
          kpiValue1: formatCurrency(totalPending),
          kpiLabel2: 'Pending Students',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(totalPending)
        };
      }

      // 12. Store Sales - Daily
      case 'store_daily': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        sales.filter(s => isWithinDate(s.date)).forEach(s => {
          if (!map[s.date]) map[s.date] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[s.date].count += 1;
          if (s.paymentMethod === 'Cash') map[s.date].cash += s.totalAmount;
          else map[s.date].bank += s.totalAmount;
          map[s.date].total += s.totalAmount;
        });

        const rows = Object.entries(map).map(([date, d]) => ({
          col1: formatDate(date),
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Daily Store Sales Report',
          headers: ['Date', 'Sale Orders', 'Cash Counter', 'Bank / UPI', 'Total Daily Sales'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Daily Sales',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Total Transactions',
          kpiValue2: rows.reduce((s, r) => s + parseInt(r.col2, 10), 0).toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 13. Store Sales - Monthly
      case 'store_monthly': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        sales.filter(s => isWithinDate(s.date)).forEach(s => {
          const my = s.date.slice(0, 7);
          if (!map[my]) map[my] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[my].count += 1;
          if (s.paymentMethod === 'Cash') map[my].cash += s.totalAmount;
          else map[my].bank += s.totalAmount;
          map[my].total += s.totalAmount;
        });

        const rows = Object.entries(map).map(([my, d]) => ({
          col1: my,
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Monthly Store Sales Report',
          headers: ['Month', 'Transactions', 'Cash Sales', 'Bank / Digital', 'Total Revenue'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Sales',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Months Active',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 14. Store Sales - Product-wise
      case 'store_product': {
        const map: Record<string, { qty: number; revenue: number; price: number }> = {};
        products.forEach(p => { map[p.id] = { qty: 0, revenue: 0, price: p.price }; });

        sales.filter(s => isWithinDate(s.date)).forEach(s => {
          s.items.forEach(it => {
            if (!map[it.productId]) map[it.productId] = { qty: 0, revenue: 0, price: it.unitPrice };
            map[it.productId].qty += it.quantity;
            map[it.productId].revenue += it.total;
          });
        });

        const rows = products.map(p => {
          const d = map[p.id] || { qty: 0, revenue: 0, price: p.price };
          return {
            col1: p.name,
            col2: p.category,
            col3: formatCurrency(p.price),
            col4: d.qty.toString(),
            col5: formatCurrency(d.revenue),
            rawTotal: d.revenue
          };
        });

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Product-Wise Store Sales Analysis',
          headers: ['Product Name', 'Category', 'Unit Price', 'Quantity Sold', 'Total Revenue'],
          aligns: ['left', 'left', 'right', 'center', 'right'],
          rows,
          kpiLabel1: 'Total Merchandise Revenue',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Catalog Items',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 15. Store Sales - Payment mode
      case 'store_mode': {
        let cashTotal = 0;
        let bankTotal = 0;
        let cashCount = 0;
        let bankCount = 0;

        sales.filter(s => isWithinDate(s.date)).forEach(s => {
          if (s.paymentMethod === 'Cash') {
            cashTotal += s.totalAmount;
            cashCount += 1;
          } else {
            bankTotal += s.totalAmount;
            bankCount += 1;
          }
        });

        const total = cashTotal + bankTotal;
        const rows = [
          {
            col1: 'Cash at Counter',
            col2: cashCount.toString(),
            col3: formatCurrency(cashTotal),
            col4: total > 0 ? `${((cashTotal / total) * 100).toFixed(1)}%` : '0%',
            col5: formatCurrency(cashTotal),
            rawTotal: cashTotal
          },
          {
            col1: 'Bank / UPI / POS Digital',
            col2: bankCount.toString(),
            col3: formatCurrency(bankTotal),
            col4: total > 0 ? `${((bankTotal / total) * 100).toFixed(1)}%` : '0%',
            col5: formatCurrency(bankTotal),
            rawTotal: bankTotal
          }
        ];

        return {
          title: 'Store Sales Payment Mode Breakdown',
          headers: ['Payment Mode', 'Transactions', 'Total Amount', 'Percentage Share', 'Net Realized'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Sales Realized',
          kpiValue1: formatCurrency(total),
          kpiLabel2: 'Transactions',
          kpiValue2: (cashCount + bankCount).toString(),
          grandTotal: formatCurrency(total)
        };
      }

      // 16. Expense - Daily
      case 'exp_daily': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        vouchers.filter(v => isWithinDate(v.date)).forEach(v => {
          if (!map[v.date]) map[v.date] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[v.date].count += 1;
          if (v.paymentMethod === 'Cash') map[v.date].cash += v.amount;
          else map[v.date].bank += v.amount;
          map[v.date].total += v.amount;
        });

        const rows = Object.entries(map).map(([date, d]) => ({
          col1: formatDate(date),
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Daily Expense Disbursement Report',
          headers: ['Date', 'Vouchers', 'Cash Expenses', 'Bank Expenses', 'Total Disbursed'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Expenses',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Vouchers Issued',
          kpiValue2: rows.reduce((s, r) => s + parseInt(r.col2, 10), 0).toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 17. Expense - Monthly
      case 'exp_monthly': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        vouchers.filter(v => isWithinDate(v.date)).forEach(v => {
          const my = v.date.slice(0, 7);
          if (!map[my]) map[my] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[my].count += 1;
          if (v.paymentMethod === 'Cash') map[my].cash += v.amount;
          else map[my].bank += v.amount;
          map[my].total += v.amount;
        });

        const rows = Object.entries(map).map(([my, d]) => ({
          col1: my,
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.col1.localeCompare(a.col1));

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Monthly Expense Expenditure Report',
          headers: ['Month', 'Vouchers', 'Cash Expenses', 'Bank Expenses', 'Total Disbursed'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Expenses',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Months Active',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 18. Expense - Category-wise
      case 'exp_category': {
        const map: Record<string, { count: number; cash: number; bank: number; total: number }> = {};
        vouchers.filter(v => isWithinDate(v.date)).forEach(v => {
          if (!map[v.categoryName]) map[v.categoryName] = { count: 0, cash: 0, bank: 0, total: 0 };
          map[v.categoryName].count += 1;
          if (v.paymentMethod === 'Cash') map[v.categoryName].cash += v.amount;
          else map[v.categoryName].bank += v.amount;
          map[v.categoryName].total += v.amount;
        });

        const rows = Object.entries(map).map(([cat, d]) => ({
          col1: cat,
          col2: d.count.toString(),
          col3: formatCurrency(d.cash),
          col4: formatCurrency(d.bank),
          col5: formatCurrency(d.total),
          rawTotal: d.total
        })).sort((a, b) => b.rawTotal - a.rawTotal);

        const grandTotal = rows.reduce((s, r) => s + r.rawTotal, 0);
        return {
          title: 'Category-Wise Operational Expenses',
          headers: ['Category Name', 'Vouchers', 'Cash Paid', 'Bank Paid', 'Total Expenditure'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Expenses',
          kpiValue1: formatCurrency(grandTotal),
          kpiLabel2: 'Expense Categories',
          kpiValue2: rows.length.toString(),
          grandTotal: formatCurrency(grandTotal)
        };
      }

      // 19. Expense - Cash vs Bank
      case 'exp_mode': {
        let cashTotal = 0;
        let bankTotal = 0;
        let cashCount = 0;
        let bankCount = 0;

        vouchers.filter(v => isWithinDate(v.date)).forEach(v => {
          if (v.paymentMethod === 'Cash') {
            cashTotal += v.amount;
            cashCount += 1;
          } else {
            bankTotal += v.amount;
            bankCount += 1;
          }
        });

        const total = cashTotal + bankTotal;
        const rows = [
          {
            col1: 'Cash Disbursements (Petty Cash)',
            col2: cashCount.toString(),
            col3: formatCurrency(cashTotal),
            col4: total > 0 ? `${((cashTotal / total) * 100).toFixed(1)}%` : '0%',
            col5: formatCurrency(cashTotal),
            rawTotal: cashTotal
          },
          {
            col1: 'Bank Disbursed (Cheque / Online)',
            col2: bankCount.toString(),
            col3: formatCurrency(bankTotal),
            col4: total > 0 ? `${((bankTotal / total) * 100).toFixed(1)}%` : '0%',
            col5: formatCurrency(bankTotal),
            rawTotal: bankTotal
          }
        ];

        return {
          title: 'Cash vs Bank Expense Disbursement',
          headers: ['Expense Channel', 'Vouchers', 'Amount Disbursed', 'Percentage Share', 'Total Amount'],
          aligns: ['left', 'center', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Total Disbursements',
          kpiValue1: formatCurrency(total),
          kpiLabel2: 'Total Vouchers',
          kpiValue2: (cashCount + bankCount).toString(),
          grandTotal: formatCurrency(total)
        };
      }

      // 20. Finance - Income & Expense Statement
      case 'fin_statement': {
        let tuitionTotal = 0;
        let busTotal = 0;
        let salesTotal = 0;

        feePayments.filter(f => isWithinDate(f.date)).forEach(f => { tuitionTotal += f.amount; });
        busPayments.filter(b => isWithinDate(b.date)).forEach(b => { busTotal += b.amount; });
        sales.filter(s => isWithinDate(s.date)).forEach(s => { salesTotal += s.totalAmount; });

        let expenseTotal = 0;
        vouchers.filter(v => isWithinDate(v.date)).forEach(v => { expenseTotal += v.amount; });

        const totalIncome = tuitionTotal + busTotal + salesTotal;
        const netSurplus = totalIncome - expenseTotal;

        const rows = [
          { col1: 'School Tuition Fee Income', col2: 'Revenue', col3: '—', col4: formatCurrency(tuitionTotal), col5: 'Credit', rawTotal: tuitionTotal },
          { col1: 'Bus Conveyance Fee Income', col2: 'Revenue', col3: '—', col4: formatCurrency(busTotal), col5: 'Credit', rawTotal: busTotal },
          { col1: 'Store Sales & Counter Cash', col2: 'Revenue', col3: '—', col4: formatCurrency(salesTotal), col5: 'Credit', rawTotal: salesTotal },
          { col1: 'Operational & Administrative Vouchers', col2: 'Expenditure', col3: formatCurrency(expenseTotal), col4: '—', col5: 'Debit', rawTotal: -expenseTotal },
          { col1: 'Net Operating Surplus / (Deficit)', col2: 'Operating Balance', col3: '—', col4: formatCurrency(netSurplus), col5: 'Net Balance', rawTotal: netSurplus },
        ];

        return {
          title: 'Income and Expense Statement',
          headers: ['Account Particulars', 'Classification', 'Debit (Expenditure)', 'Credit (Income)', 'Status'],
          aligns: ['left', 'center', 'right', 'right', 'center'],
          rows,
          kpiLabel1: 'Total Operating Income',
          kpiValue1: formatCurrency(totalIncome),
          kpiLabel2: 'Net Operating Balance',
          kpiValue2: formatCurrency(netSurplus),
          grandTotal: formatCurrency(netSurplus)
        };
      }

      // 21. Finance - Cash Book
      case 'fin_cashbook': {
        const openingCash = paymentSettings.openingCashBalance || 75000;
        let runningBalance = openingCash;

        const cashTxns: { date: string; desc: string; debit: number; credit: number; balance: number }[] = [];

        // Collect all cash events
        feePayments.filter(f => f.method === 'Cash' && isWithinDate(f.date)).forEach(f => {
          cashTxns.push({ date: f.date, desc: `Tuition Fee: ${f.studentName}`, debit: 0, credit: f.amount, balance: 0 });
        });
        busPayments.filter(b => b.method === 'Cash' && isWithinDate(b.date)).forEach(b => {
          cashTxns.push({ date: b.date, desc: `Bus Fee: ${b.studentName}`, debit: 0, credit: b.amount, balance: 0 });
        });
        sales.filter(s => s.paymentMethod === 'Cash' && isWithinDate(s.date)).forEach(s => {
          cashTxns.push({ date: s.date, desc: `Store Sale (${s.receiptNumber})`, debit: 0, credit: s.totalAmount, balance: 0 });
        });
        vouchers.filter(v => v.paymentMethod === 'Cash' && isWithinDate(v.date)).forEach(v => {
          cashTxns.push({ date: v.date, desc: `Voucher: ${v.paidTo} (${v.description})`, debit: v.amount, credit: 0, balance: 0 });
        });
        transfers.filter(t => isWithinDate(t.date)).forEach(t => {
          if (t.fromAccount === 'Cash') {
            cashTxns.push({ date: t.date, desc: `Transfer: Deposited into Bank (${t.transferNumber})`, debit: t.amount, credit: 0, balance: 0 });
          } else if (t.toAccount === 'Cash') {
            cashTxns.push({ date: t.date, desc: `Transfer: Withdrawn from Bank (${t.transferNumber})`, debit: 0, credit: t.amount, balance: 0 });
          }
        });

        cashTxns.sort((a, b) => a.date.localeCompare(b.date));

        const rows = cashTxns.map(tx => {
          runningBalance += tx.credit - tx.debit;
          return {
            col1: formatDate(tx.date),
            col2: tx.desc,
            col3: tx.credit > 0 ? formatCurrency(tx.credit) : '—',
            col4: tx.debit > 0 ? formatCurrency(tx.debit) : '—',
            col5: formatCurrency(runningBalance),
            rawTotal: runningBalance
          };
        });

        return {
          title: 'Daily Cash Book',
          headers: ['Date', 'Particulars', 'Cash Receipts (In)', 'Cash Payments (Out)', 'Closing Balance'],
          aligns: ['left', 'left', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Opening Cash Balance',
          kpiValue1: formatCurrency(openingCash),
          kpiLabel2: 'Current Cash Balance',
          kpiValue2: formatCurrency(runningBalance),
          grandTotal: formatCurrency(runningBalance)
        };
      }

      // 22. Finance - Bank Book
      case 'fin_bankbook': {
        const openingBank = paymentSettings.openingBankBalance || 450000;
        let runningBalance = openingBank;

        const bankTxns: { date: string; desc: string; debit: number; credit: number; balance: number }[] = [];

        feePayments.filter(f => f.method !== 'Cash' && isWithinDate(f.date)).forEach(f => {
          bankTxns.push({ date: f.date, desc: `Tuition Online: ${f.studentName}`, debit: 0, credit: f.amount, balance: 0 });
        });
        busPayments.filter(b => b.method !== 'Cash' && isWithinDate(b.date)).forEach(b => {
          bankTxns.push({ date: b.date, desc: `Bus Online: ${b.studentName}`, debit: 0, credit: b.amount, balance: 0 });
        });
        sales.filter(s => s.paymentMethod !== 'Cash' && isWithinDate(s.date)).forEach(s => {
          bankTxns.push({ date: s.date, desc: `Store POS: ${s.receiptNumber}`, debit: 0, credit: s.totalAmount, balance: 0 });
        });
        vouchers.filter(v => v.paymentMethod !== 'Cash' && isWithinDate(v.date)).forEach(v => {
          bankTxns.push({ date: v.date, desc: `Bank Payment: ${v.paidTo}`, debit: v.amount, credit: 0, balance: 0 });
        });
        transfers.filter(t => isWithinDate(t.date)).forEach(t => {
          if (t.fromAccount === 'Bank') {
            bankTxns.push({ date: t.date, desc: `Transfer: Withdrawn to Cash (${t.transferNumber})`, debit: t.amount, credit: 0, balance: 0 });
          } else if (t.toAccount === 'Bank') {
            bankTxns.push({ date: t.date, desc: `Transfer: Cash Deposited (${t.transferNumber})`, debit: 0, credit: t.amount, balance: 0 });
          }
        });

        bankTxns.sort((a, b) => a.date.localeCompare(b.date));

        const rows = bankTxns.map(tx => {
          runningBalance += tx.credit - tx.debit;
          return {
            col1: formatDate(tx.date),
            col2: tx.desc,
            col3: tx.credit > 0 ? formatCurrency(tx.credit) : '—',
            col4: tx.debit > 0 ? formatCurrency(tx.debit) : '—',
            col5: formatCurrency(runningBalance),
            rawTotal: runningBalance
          };
        });

        return {
          title: 'Bank Passbook & Ledger Book',
          headers: ['Date', 'Transaction Particulars', 'Bank Credits (In)', 'Bank Debits (Out)', 'Balance in Bank'],
          aligns: ['left', 'left', 'right', 'right', 'right'],
          rows,
          kpiLabel1: 'Opening Bank Balance',
          kpiValue1: formatCurrency(openingBank),
          kpiLabel2: 'Current Bank Balance',
          kpiValue2: formatCurrency(runningBalance),
          grandTotal: formatCurrency(runningBalance)
        };
      }

      // 23. Finance - Overall summary
      case 'fin_summary':
      default: {
        let totalIncome = 0;
        feePayments.forEach(f => { totalIncome += f.amount; });
        busPayments.forEach(b => { totalIncome += b.amount; });
        sales.forEach(s => { totalIncome += s.totalAmount; });

        let totalExpenses = 0;
        vouchers.forEach(v => { totalExpenses += v.amount; });

        const rows = [
          { col1: 'School Tuition Collections', col2: `${feePayments.length} receipts`, col3: formatCurrency(totalIncome), col4: 'Active', col5: formatCurrency(totalIncome), rawTotal: totalIncome },
          { col1: 'Bus Conveyance Collections', col2: `${busPayments.length} receipts`, col3: '—', col4: 'Active', col5: '—', rawTotal: 0 },
          { col1: 'Operating Expenses Incurred', col2: `${vouchers.length} vouchers`, col3: formatCurrency(totalExpenses), col4: 'Audited', col5: formatCurrency(totalExpenses), rawTotal: totalExpenses },
          { col1: 'Net Liquidity Surplus', col2: 'Verified', col3: formatCurrency(totalIncome - totalExpenses), col4: 'Healthy', col5: formatCurrency(totalIncome - totalExpenses), rawTotal: totalIncome - totalExpenses },
        ];

        return {
          title: 'Overall Financial Summary Report',
          headers: ['Audit Domain', 'Documentation', 'Total Amount', 'Status', 'Net Audit Position'],
          aligns: ['left', 'center', 'right', 'center', 'right'],
          rows,
          kpiLabel1: 'Consolidated Income',
          kpiValue1: formatCurrency(totalIncome),
          kpiLabel2: 'Consolidated Expense',
          kpiValue2: formatCurrency(totalExpenses),
          grandTotal: formatCurrency(totalIncome - totalExpenses)
        };
      }
    }
  }, [
    selectedReportId,
    startDate,
    endDate,
    classFilter,
    routeFilter,
    students,
    feePayments,
    busPayments,
    busRoutes,
    sales,
    products,
    vouchers,
    transfers,
    concessions,
    paymentSettings
  ]);

  // CSV Export
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push([`"${reportData.title}"`].join(','));
    csvRows.push([`"School: ${generalSettings.schoolName}"`].join(','));
    csvRows.push([`"Generated on: ${new Date().toLocaleDateString()}"`].join(','));
    csvRows.push('');
    csvRows.push(reportData.headers.map(h => `"${h}"`).join(','));

    reportData.rows.forEach(r => {
      csvRows.push([
        `"${r.col1}"`,
        `"${r.col2}"`,
        `"${r.col3}"`,
        `"${r.col4}"`,
        `"${r.col5}"`
      ].join(','));
    });

    csvRows.push('');
    csvRows.push([`"Report Total"`, `""`, `""`, `""`, `"${reportData.grandTotal}"`].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReportId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Reports & Audits</h1>
        </div>

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
            onClick={handlePrintReport}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EAEAF0', borderRadius: '8px', alignSelf: 'flex-start' }}>
        {[
          { id: 'schoolFee', label: 'School Fee Reports', icon: GraduationCap },
          { id: 'busFee', label: 'Bus Fee Reports', icon: Bus },
          { id: 'storeSales', label: 'Store Sales Reports', icon: ShoppingBag },
          { id: 'expense', label: 'Expense Reports', icon: FileText },
          { id: 'finance', label: 'Finance Reports', icon: Wallet }
        ].map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as ReportCategory)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: activeCategory === cat.id ? 600 : 500,
                color: activeCategory === cat.id ? '#5A54B4' : 'var(--color-text-secondary)',
                backgroundColor: activeCategory === cat.id ? '#FFFFFF' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Selection Sub-Bar & Filters */}
      <Card padding="16px">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Report Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              Select Report:
            </span>
            <select
              value={selectedReportId}
              onChange={e => setSelectedReportId(e.target.value)}
              style={{ height: '36px', fontSize: '13px', fontWeight: 600, flex: 1, maxWidth: '320px', color: 'var(--color-primary)' }}
            >
              {categoryReports.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Contextual Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Date Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <Calendar size={14} color="#777777" />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
                title="Start Date"
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
                title="End Date"
              />
            </div>

            {/* Class filter if student report */}
            {(selectedReportId === 'sf_student' || selectedReportId === 'sf_pending') && (
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <option value="All">All Classes</option>
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {/* Route filter if bus student report */}
            {(selectedReportId === 'bus_student' || selectedReportId === 'bus_pending') && (
              <select
                value={routeFilter}
                onChange={e => setRouteFilter(e.target.value)}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <option value="All">All Bus Routes</option>
                {busRoutes.map(r => <option key={r.id} value={r.routeName}>{r.routeName}</option>)}
              </select>
            )}

            {(startDate || endDate || classFilter !== 'All' || routeFilter !== 'All') && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setClassFilter('All');
                  setRouteFilter('All');
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
                Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Summary Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{reportData.kpiLabel1}</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
            {reportData.kpiValue1}
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{reportData.kpiLabel2}</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {reportData.kpiValue2}
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Academic Session</span>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {generalSettings.academicYear}
          </div>
        </div>
      </div>

      {/* Report Table Card */}
      <Card padding="0">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="section-heading" style={{ margin: 0 }}>
            {reportData.title}
          </h2>
          <Badge variant="neutral">
            {reportData.rows.length} rows recorded
          </Badge>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {reportData.headers.map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: (reportData.aligns[i] || 'left') as React.CSSProperties['textAlign']
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={reportData.headers.length}
                    style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}
                  >
                    No records found matching the selected report filters.
                  </td>
                </tr>
              ) : (
                reportData.rows
                  .slice((reportPage - 1) * 20, reportPage * 20)
                  .map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: reportData.aligns[0] as React.CSSProperties['textAlign'], fontWeight: 500 }}>
                      {row.col1}
                    </td>
                    <td style={{ textAlign: reportData.aligns[1] as React.CSSProperties['textAlign'], fontSize: '12px' }}>
                      {row.col2}
                    </td>
                    <td style={{ textAlign: reportData.aligns[2] as React.CSSProperties['textAlign'], fontSize: '13px' }}>
                      {row.col3}
                    </td>
                    <td style={{ textAlign: reportData.aligns[3] as React.CSSProperties['textAlign'], fontSize: '13px' }}>
                      {row.col4}
                    </td>
                    <td
                      style={{
                        textAlign: reportData.aligns[4] as React.CSSProperties['textAlign'],
                        fontWeight: 600,
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {row.col5}
                    </td>
                  </tr>
                ))
              )}
              {reportData.rows.length > 0 && (
                <tr style={{ backgroundColor: '#FAFAFC', fontWeight: 700 }}>
                  <td colSpan={reportData.headers.length - 1} style={{ textAlign: 'right', paddingRight: '16px' }}>
                    Report Total:
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontSize: '14px' }}>
                    {reportData.grandTotal}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={reportPage}
          totalItems={reportData.rows.length}
          pageSize={20}
          onPageChange={setReportPage}
          itemName="records"
        />
      </Card>
    </div>
  );
};
