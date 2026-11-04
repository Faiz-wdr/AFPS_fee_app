import { createContext } from 'react';
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

export interface AppContextType {
  // Data
  students: Student[];
  feePayments: FeePayment[];
  busRoutes: BusRoute[];
  busPayments: BusPayment[];
  products: Product[];
  sales: SaleTransaction[];
  vouchers: Voucher[];
  feeCategories: FeeCategory[];
  feeStructures: FeeStructure[];
  concessions: Concession[];
  expenseCategories: ExpenseCategory[];
  transactions: Transaction[];
  transfers: FundTransfer[];
  generalSettings: GeneralSettings;
  paymentSettings: PaymentSettings;
  staffUsers: StaffUser[];

  // Student actions
  addStudent: (data: Omit<Student, 'id'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  applyStudentConcession: (studentId: string, concessionId: string | null, customAmount?: number) => void;

  // School Fee actions
  recordSchoolFeePayment: (params: {
    studentId: string;
    amount: number;
    method: PaymentMethod;
    category?: string;
    academicYear?: string;
    months?: string[];
    referenceNo?: string;
    remarks?: string;
  }) => FeePayment;

  // Bus actions
  addBusRoute: (data: Omit<BusRoute, 'id' | 'assignedStudents'>) => BusRoute;
  updateBusRoute: (route: BusRoute) => void;
  deleteBusRoute: (id: string) => void;
  assignStudentBusRoute: (studentId: string, routeNameOrNull: string | null) => void;
  recordBusFeePayment: (params: {
    studentId: string;
    amount: number;
    method: PaymentMethod;
    referenceNo?: string;
    remarks?: string;
  }) => BusPayment;

  // Store Sales actions
  addProduct: (data: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  toggleProductStatus: (id: string) => void;
  recordSale: (params: {
    items: { productId: string; quantity: number }[];
    discount?: number;
    paymentMethod: PaymentMethod;
    customerName?: string;
    remarks?: string;
  }) => SaleTransaction;

  // Voucher actions
  createVoucher: (data: {
    date: string;
    categoryId: string;
    description: string;
    paidTo: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNo?: string;
    remarks?: string;
    preparedBy?: string;
  }) => Voucher;

  // Finance Transfer actions
  recordFundTransfer: (data: {
    date: string;
    fromAccount: "Cash" | "Bank";
    toAccount: "Cash" | "Bank";
    amount: number;
    referenceNo?: string;
    description: string;
    transferredBy?: string;
  }) => FundTransfer;

  // Settings / Config actions
  addFeeCategory: (cat: Omit<FeeCategory, 'id'>) => FeeCategory;
  updateFeeCategory: (cat: FeeCategory) => void;
  toggleFeeCategoryStatus: (id: string) => void;

  addFeeStructure: (fs: Omit<FeeStructure, 'id'>) => FeeStructure;
  updateFeeStructure: (fs: FeeStructure) => void;
  deleteFeeStructure: (id: string) => void;

  addConcession: (conc: Omit<Concession, 'id'>) => Concession;
  updateConcession: (conc: Concession) => void;
  toggleConcessionStatus: (id: string) => void;

  updateGeneralSettings: (settings: GeneralSettings) => void;
  updatePaymentSettings: (settings: PaymentSettings) => void;

  // User & Staff Settings actions
  addStaffUser: (user: Omit<StaffUser, 'id'>) => StaffUser;
  updateStaffUser: (user: StaffUser) => void;
  deleteStaffUser: (id: string) => void;
  toggleStaffUserStatus: (id: string) => void;

  // Backup & Restore
  getFullBackupData: () => string;
  importFullBackup: (backupJson: string) => boolean;

  // Reset
  resetToDefaults: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);
