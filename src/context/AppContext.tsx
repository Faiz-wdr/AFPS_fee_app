import React, { useState, useEffect, useMemo } from 'react';
import type {
  Student,
  FeePayment,
  BusRoute,
  BusPayment,
  Product,
  SaleTransaction,
  Voucher,
  FeeCategory,
  FeeStructure,
  Concession,
  ExpenseCategory,
  Transaction,
  PaymentMethod,
  FundTransfer,
  GeneralSettings,
  PaymentSettings,
  StaffUser
} from '../types';
import { initialStudents } from '../data/students';
import {
  initialBusRoutes,
  initialBusPayments,
  initialFeePayments,
  initialProducts,
  initialSales,
  initialExpenseCategories,
  initialVouchers,
  initialFeeCategories,
  initialFeeStructures,
  initialConcessions,
  initialFundTransfers,
  initialGeneralSettings,
  initialPaymentSettings,
  initialStaffUsers
} from '../data/mockData';
import { AppContext } from './context';

const STORAGE_KEY = 'afps_school_management_phase2_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or default mock data
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [feePayments, setFeePayments] = useState<FeePayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_feePayments`);
      return saved ? JSON.parse(saved) : initialFeePayments;
    } catch {
      return initialFeePayments;
    }
  });

  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_busRoutes`);
      return saved ? JSON.parse(saved) : initialBusRoutes;
    } catch {
      return initialBusRoutes;
    }
  });

  const [busPayments, setBusPayments] = useState<BusPayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_busPayments`);
      return saved ? JSON.parse(saved) : initialBusPayments;
    } catch {
      return initialBusPayments;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vouchers`);
      return saved ? JSON.parse(saved) : initialVouchers;
    } catch {
      return initialVouchers;
    }
  });

  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_feeCategories`);
      return saved ? JSON.parse(saved) : initialFeeCategories;
    } catch {
      return initialFeeCategories;
    }
  });

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_feeStructures`);
      return saved ? JSON.parse(saved) : initialFeeStructures;
    } catch {
      return initialFeeStructures;
    }
  });

  const [concessions, setConcessions] = useState<Concession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_concessions`);
      return saved ? JSON.parse(saved) : initialConcessions;
    } catch {
      return initialConcessions;
    }
  });

  const [expenseCategories] = useState<ExpenseCategory[]>(initialExpenseCategories);

  const [transfers, setTransfers] = useState<FundTransfer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transfers`);
      return saved ? JSON.parse(saved) : initialFundTransfers;
    } catch {
      return initialFundTransfers;
    }
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_generalSettings`);
      return saved ? JSON.parse(saved) : initialGeneralSettings;
    } catch {
      return initialGeneralSettings;
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_paymentSettings`);
      return saved ? { ...initialPaymentSettings, ...JSON.parse(saved) } : initialPaymentSettings;
    } catch {
      return initialPaymentSettings;
    }
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_staffUsers`);
      return saved ? JSON.parse(saved) : initialStaffUsers;
    } catch {
      return initialStaffUsers;
    }
  });

  // Sync to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_feePayments`, JSON.stringify(feePayments));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [feePayments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_busRoutes`, JSON.stringify(busRoutes));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [busRoutes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_busPayments`, JSON.stringify(busPayments));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [busPayments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_vouchers`, JSON.stringify(vouchers));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [vouchers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_feeCategories`, JSON.stringify(feeCategories));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [feeCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_feeStructures`, JSON.stringify(feeStructures));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [feeStructures]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_concessions`, JSON.stringify(concessions));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [concessions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transfers`, JSON.stringify(transfers));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [transfers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_generalSettings`, JSON.stringify(generalSettings));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [generalSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_paymentSettings`, JSON.stringify(paymentSettings));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [paymentSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_staffUsers`, JSON.stringify(staffUsers));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [staffUsers]);

  // Unified financial transactions derived from payments, sales, and vouchers
  const transactions: Transaction[] = useMemo(() => {
    const list: Transaction[] = [];

    // School Fee payments
    feePayments.forEach((fp) => {
      list.push({
        id: fp.receiptNumber,
        date: fp.date,
        particulars: `${fp.studentName} (${fp.className}-${fp.division})`,
        category: "School Fee",
        type: "income",
        method: fp.method,
        amount: Math.round(fp.amount),
        status: "Completed",
        referenceId: fp.id
      });
    });

    // Bus Fee payments
    busPayments.forEach((bp) => {
      list.push({
        id: bp.receiptNumber,
        date: bp.date,
        particulars: `${bp.studentName} - ${bp.routeName}`,
        category: "Bus Fee",
        type: "income",
        method: bp.method,
        amount: Math.round(bp.amount),
        status: "Completed",
        referenceId: bp.id
      });
    });

    // Sales transactions
    sales.forEach((s) => {
      const summaryItems = s.items.map(i => `${i.productName} (x${i.quantity})`).join(', ');
      list.push({
        id: s.receiptNumber,
        date: s.date,
        particulars: s.customerName ? `Sale: ${s.customerName} - ${summaryItems}` : `Store Sale: ${summaryItems}`,
        category: "Sales",
        type: "income",
        method: s.paymentMethod,
        amount: Math.round(s.totalAmount),
        status: "Completed",
        referenceId: s.id
      });
    });

    // Voucher expenses
    vouchers.forEach((v) => {
      list.push({
        id: v.voucherNumber,
        date: v.date,
        particulars: `${v.paidTo} - ${v.description}`,
        category: "Voucher",
        type: "expense",
        method: v.paymentMethod,
        amount: Math.round(v.amount),
        status: "Completed",
        referenceId: v.id
      });
    });

    // Fund transfers (between Cash & Bank)
    transfers.forEach((t) => {
      list.push({
        id: t.transferNumber,
        date: t.date,
        particulars: `${t.fromAccount} → ${t.toAccount}: ${t.description}`,
        category: "Transfer",
        type: "transfer",
        method: t.fromAccount,
        amount: Math.round(t.amount),
        status: "Completed",
        referenceId: t.id
      });
    });

    // Sort descending by date, then id
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id));
  }, [feePayments, busPayments, sales, vouchers, transfers]);

  // Recalculate bus routes assignedStudents count accurately
  const recalculateRouteCounts = (updatedStudents: Student[]) => {
    setBusRoutes(prevRoutes =>
      prevRoutes.map(route => {
        const count = updatedStudents.filter(
          s => s.busRoute === route.routeNumber || s.busRoute === route.routeName
        ).length;
        return { ...route, assignedStudents: count };
      })
    );
  };

  // Student Actions
  const addStudent = (data: Omit<Student, 'id'>): Student => {
    const nextId = (students.length + 1).toString();
    const newStudent: Student = {
      ...data,
      id: nextId,
      monthlyFee: Math.round(data.monthlyFee || 1500),
      schoolFeeTotal: Math.round(data.schoolFeeTotal || data.monthlyFee * 10),
      schoolFeePaid: Math.round(data.schoolFeePaid || 0),
      busFeeTotal: data.busRoute ? 6000 : 0,
      busFeePaid: 0,
      feeStatus: data.schoolFeePaid && data.schoolFeePaid >= (data.schoolFeeTotal || 15000) ? 'Paid' : data.schoolFeePaid ? 'Partial' : 'Pending',
      status: data.status || 'Active'
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    recalculateRouteCounts(updated);
    return newStudent;
  };

  const updateStudent = (student: Student) => {
    const updated = students.map(s => (s.id === student.id ? student : s));
    setStudents(updated);
    recalculateRouteCounts(updated);
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    recalculateRouteCounts(updated);
  };

  const applyStudentConcession = (studentId: string, concessionId: string | null, customAmount?: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        if (!concessionId) {
          return { ...s, concessionId: null, concessionAmount: 0 };
        }
        const conc = concessions.find(c => c.id === concessionId);
        let discount = 0;
        if (conc) {
          if (conc.discountType === 'Percentage') {
            discount = Math.round((s.monthlyFee * conc.discountValue) / 100);
          } else {
            discount = conc.discountValue;
          }
        }
        if (customAmount !== undefined) {
          discount = customAmount;
        }
        return {
          ...s,
          concessionId,
          concessionAmount: discount
        };
      })
    );
  };

  // School Fee Actions
  const recordSchoolFeePayment = ({
    studentId,
    amount,
    method,
    category = "School Fee",
    academicYear = "2026-2027",
    months,
    referenceNo,
    remarks
  }: {
    studentId: string;
    amount: number;
    method: PaymentMethod;
    category?: string;
    academicYear?: string;
    months?: string[];
    referenceNo?: string;
    remarks?: string;
  }): FeePayment => {
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");

    const intAmount = Math.round(amount);
    const receiptSeq = 1000 + feePayments.length + 1;
    const receiptNumber = `REC-2026-${receiptSeq}`;

    const newPayment: FeePayment = {
      id: `FP-${receiptSeq}`,
      receiptNumber,
      studentId,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      className: student.className,
      division: student.division,
      date: new Date().toISOString().split('T')[0],
      amount: intAmount,
      method,
      referenceNo,
      remarks,
      category,
      academicYear,
      months,
      status: "Completed"
    };

    setFeePayments(prev => [newPayment, ...prev]);

    // Update student's paid status
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        const currentPaid = s.schoolFeePaid || 0;
        const newPaid = currentPaid + intAmount;
        const totalApplicable = s.schoolFeeTotal || s.monthlyFee * 10;
        const newStatus: "Paid" | "Pending" | "Partial" =
          newPaid >= totalApplicable ? "Paid" : newPaid > 0 ? "Partial" : "Pending";
        return {
          ...s,
          schoolFeePaid: newPaid,
          feeStatus: newStatus
        };
      })
    );

    return newPayment;
  };

  // Bus Route Actions
  const addBusRoute = (data: Omit<BusRoute, 'id' | 'assignedStudents'>): BusRoute => {
    const nextNum = busRoutes.length + 1;
    const newRoute: BusRoute = {
      ...data,
      id: `route-0${nextNum}`,
      assignedStudents: 0
    };
    setBusRoutes(prev => [...prev, newRoute]);
    return newRoute;
  };

  const updateBusRoute = (route: BusRoute) => {
    setBusRoutes(prev => prev.map(r => (r.id === route.id ? route : r)));
  };

  const deleteBusRoute = (id: string) => {
    const targetRoute = busRoutes.find(r => r.id === id);
    if (!targetRoute) return;

    // Unassign students from this route
    const updatedStudents = students.map(s =>
      s.busRoute === targetRoute.routeNumber || s.busRoute === targetRoute.routeName ? { ...s, busRoute: null } : s
    );
    setStudents(updatedStudents);
    setBusRoutes(prev => prev.filter(r => r.id !== id));
  };

  const assignStudentBusRoute = (studentId: string, routeNameOrNull: string | null) => {
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const targetRoute = busRoutes.find(r => r.routeNumber === routeNameOrNull || r.routeName === routeNameOrNull);
      const fee = targetRoute ? targetRoute.monthlyFee * 4 : 0;
      return {
        ...s,
        busRoute: targetRoute ? targetRoute.routeName : routeNameOrNull,
        busFeeTotal: fee
      };
    });
    setStudents(updated);
    recalculateRouteCounts(updated);
  };

  const recordBusFeePayment = ({
    studentId,
    amount,
    method,
    referenceNo,
    remarks
  }: {
    studentId: string;
    amount: number;
    method: PaymentMethod;
    referenceNo?: string;
    remarks?: string;
  }): BusPayment => {
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");

    const intAmount = Math.round(amount);
    const receiptSeq = 1000 + busPayments.length + 1;
    const receiptNumber = `BUS-2026-${receiptSeq}`;
    const targetRoute = busRoutes.find(r => r.routeNumber === student.busRoute || r.routeName === student.busRoute);

    const newPayment: BusPayment = {
      id: `BP-${receiptSeq}`,
      receiptNumber,
      studentId,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      className: student.className,
      division: student.division,
      routeId: targetRoute ? targetRoute.id : "route-unassigned",
      routeName: targetRoute ? targetRoute.routeName : (student.busRoute || "Unassigned"),
      date: new Date().toISOString().split('T')[0],
      amount: intAmount,
      method,
      referenceNo,
      remarks,
      status: "Completed"
    };

    setBusPayments(prev => [newPayment, ...prev]);

    // Update student's bus fee paid amount
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          busFeePaid: (s.busFeePaid || 0) + intAmount
        };
      })
    );

    return newPayment;
  };

  // Product & Store Sales Actions
  const addProduct = (data: Omit<Product, 'id'>): Product => {
    const nextSeq = products.length + 1;
    const newProduct: Product = {
      ...data,
      id: `prod-${nextSeq < 10 ? '0' : ''}${nextSeq}`
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p))
    );
  };

  const recordSale = ({
    items,
    discount = 0,
    paymentMethod,
    customerName,
    remarks
  }: {
    items: { productId: string; quantity: number }[];
    discount?: number;
    paymentMethod: PaymentMethod;
    customerName?: string;
    remarks?: string;
  }): SaleTransaction => {
    const saleSeq = 1000 + sales.length + 1;
    const receiptNumber = `STR-2026-${saleSeq}`;

    let subtotal = 0;
    const resolvedItems = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const unitPrice = prod ? prod.price : 0;
      const total = unitPrice * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        productName: prod ? prod.name : "Product",
        quantity: item.quantity,
        unitPrice,
        total
      };
    });

    const finalDiscount = Math.round(discount);
    const totalAmount = Math.max(0, subtotal - finalDiscount);

    const newSale: SaleTransaction = {
      id: `SALE-${saleSeq}`,
      receiptNumber,
      date: new Date().toISOString().split('T')[0],
      items: resolvedItems,
      subtotal,
      discount: finalDiscount,
      totalAmount,
      paymentMethod,
      customerName,
      remarks,
      status: "Completed"
    };

    setSales(prev => [newSale, ...prev]);

    // Decrement stock for purchased products
    setProducts(prev =>
      prev.map(p => {
        const itemMatch = items.find(i => i.productId === p.id);
        if (itemMatch) {
          return { ...p, stock: Math.max(0, p.stock - itemMatch.quantity) };
        }
        return p;
      })
    );

    return newSale;
  };

  // Voucher Actions
  const createVoucher = (data: {
    date: string;
    categoryId: string;
    description: string;
    paidTo: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNo?: string;
    remarks?: string;
    preparedBy?: string;
  }): Voucher => {
    const voucherSeq = 1000 + vouchers.length + 1;
    const voucherNumber = `VCH-2026-${voucherSeq}`;
    const category = expenseCategories.find(c => c.id === data.categoryId);

    const newVoucher: Voucher = {
      id: `VCH-${voucherSeq}`,
      voucherNumber,
      date: data.date,
      categoryId: data.categoryId,
      categoryName: category ? category.name : "Other Expenses",
      description: data.description,
      paidTo: data.paidTo,
      amount: Math.round(data.amount),
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo,
      remarks: data.remarks,
      preparedBy: data.preparedBy || "School Admin",
      status: "Completed"
    };

    setVouchers(prev => [newVoucher, ...prev]);
    return newVoucher;
  };

  // Settings Actions
  const addFeeCategory = (cat: Omit<FeeCategory, 'id'>): FeeCategory => {
    const id = `cat-${feeCategories.length + 1 < 10 ? '0' : ''}${feeCategories.length + 1}`;
    const newCat: FeeCategory = { ...cat, id };
    setFeeCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateFeeCategory = (cat: FeeCategory) => {
    setFeeCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));
  };

  const toggleFeeCategoryStatus = (id: string) => {
    setFeeCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
  };

  const addFeeStructure = (fs: Omit<FeeStructure, 'id'>): FeeStructure => {
    const id = `fs-${feeStructures.length + 1 < 10 ? '0' : ''}${feeStructures.length + 1}`;
    const newFs: FeeStructure = { ...fs, id, amount: Math.round(fs.amount) };
    setFeeStructures(prev => [...prev, newFs]);
    return newFs;
  };

  const updateFeeStructure = (fs: FeeStructure) => {
    setFeeStructures(prev => prev.map(f => (f.id === fs.id ? { ...fs, amount: Math.round(fs.amount) } : f)));
  };

  const deleteFeeStructure = (id: string) => {
    setFeeStructures(prev => prev.filter(f => f.id !== id));
  };

  const addConcession = (conc: Omit<Concession, 'id'>): Concession => {
    const id = `conc-${concessions.length + 1 < 10 ? '0' : ''}${concessions.length + 1}`;
    const newConc: Concession = { ...conc, id, discountValue: Math.round(conc.discountValue) };
    setConcessions(prev => [...prev, newConc]);
    return newConc;
  };

  const updateConcession = (conc: Concession) => {
    setConcessions(prev => prev.map(c => (c.id === conc.id ? { ...conc, discountValue: Math.round(conc.discountValue) } : c)));
  };

  const toggleConcessionStatus = (id: string) => {
    setConcessions(prev =>
      prev.map(c => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
  };

  // Fund Transfer Action
  const recordFundTransfer = (data: {
    date: string;
    fromAccount: "Cash" | "Bank";
    toAccount: "Cash" | "Bank";
    amount: number;
    referenceNo?: string;
    description: string;
    transferredBy?: string;
  }): FundTransfer => {
    const seq = transfers.length + 1;
    const transferNumber = `TRF-${new Date().getFullYear()}-${1000 + seq}`;
    const newTransfer: FundTransfer = {
      id: `TRF-${Date.now()}`,
      transferNumber,
      date: data.date,
      fromAccount: data.fromAccount,
      toAccount: data.toAccount,
      amount: Math.round(data.amount),
      referenceNo: data.referenceNo,
      description: data.description,
      transferredBy: data.transferredBy || "Accounts Officer",
      status: "Completed"
    };

    setTransfers(prev => [newTransfer, ...prev]);
    return newTransfer;
  };

  // Settings Actions
  const updateGeneralSettings = (settings: GeneralSettings) => {
    setGeneralSettings(settings);
  };

  const updatePaymentSettings = (settings: PaymentSettings) => {
    setPaymentSettings(settings);
  };

  // Staff User Actions
  const addStaffUser = (user: Omit<StaffUser, 'id'>): StaffUser => {
    const nextId = `staff-${Date.now()}`;
    const newStaff: StaffUser = { ...user, id: nextId };
    setStaffUsers(prev => [...prev, newStaff]);
    return newStaff;
  };

  const updateStaffUser = (user: StaffUser) => {
    setStaffUsers(prev => prev.map(s => (s.id === user.id ? user : s)));
  };

  const deleteStaffUser = (id: string) => {
    setStaffUsers(prev => prev.filter(s => s.id !== id));
  };

  const toggleStaffUserStatus = (id: string) => {
    setStaffUsers(prev =>
      prev.map(s => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s))
    );
  };

  // Backup & Restore
  const getFullBackupData = (): string => {
    const backupObj = {
      version: "afps-v3.0",
      exportedAt: new Date().toISOString(),
      students,
      feePayments,
      busRoutes,
      busPayments,
      products,
      sales,
      vouchers,
      feeCategories,
      feeStructures,
      concessions,
      transfers,
      generalSettings,
      paymentSettings,
      staffUsers
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importFullBackup = (backupJson: string): boolean => {
    try {
      const data = JSON.parse(backupJson);
      if (!data || !Array.isArray(data.students)) {
        throw new Error("Invalid backup format: students array missing.");
      }

      if (data.students) setStudents(data.students);
      if (data.feePayments) setFeePayments(data.feePayments);
      if (data.busRoutes) setBusRoutes(data.busRoutes);
      if (data.busPayments) setBusPayments(data.busPayments);
      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);
      if (data.vouchers) setVouchers(data.vouchers);
      if (data.feeCategories) setFeeCategories(data.feeCategories);
      if (data.feeStructures) setFeeStructures(data.feeStructures);
      if (data.concessions) setConcessions(data.concessions);
      if (data.transfers) setTransfers(data.transfers);
      if (data.generalSettings) setGeneralSettings(data.generalSettings);
      if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
      if (data.staffUsers) setStaffUsers(data.staffUsers);

      return true;
    } catch (err) {
      console.error("Backup import failed:", err);
      return false;
    }
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setStudents(initialStudents);
    setFeePayments(initialFeePayments);
    setBusRoutes(initialBusRoutes);
    setBusPayments(initialBusPayments);
    setProducts(initialProducts);
    setSales(initialSales);
    setVouchers(initialVouchers);
    setFeeCategories(initialFeeCategories);
    setFeeStructures(initialFeeStructures);
    setConcessions(initialConcessions);
    setTransfers(initialFundTransfers);
    setGeneralSettings(initialGeneralSettings);
    setPaymentSettings(initialPaymentSettings);
    setStaffUsers(initialStaffUsers);
  };

  return (
    <AppContext.Provider
      value={{
        students,
        feePayments,
        busRoutes,
        busPayments,
        products,
        sales,
        vouchers,
        feeCategories,
        feeStructures,
        concessions,
        expenseCategories,
        transactions,
        transfers,
        generalSettings,
        paymentSettings,
        staffUsers,

        addStudent,
        updateStudent,
        deleteStudent,
        applyStudentConcession,

        recordSchoolFeePayment,

        addBusRoute,
        updateBusRoute,
        deleteBusRoute,
        assignStudentBusRoute,
        recordBusFeePayment,

        addProduct,
        updateProduct,
        toggleProductStatus,
        recordSale,

        createVoucher,

        recordFundTransfer,

        addFeeCategory,
        updateFeeCategory,
        toggleFeeCategoryStatus,
        addFeeStructure,
        updateFeeStructure,
        deleteFeeStructure,
        addConcession,
        updateConcession,
        toggleConcessionStatus,

        updateGeneralSettings,
        updatePaymentSettings,

        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        toggleStaffUserStatus,

        getFullBackupData,
        importFullBackup,

        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

