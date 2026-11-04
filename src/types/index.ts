export type FeeStatus = "Paid" | "Pending" | "Partial";

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  className: string;
  division: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  monthlyFee: number;
  busRoute: string | null;
  feeStatus: FeeStatus;
  status?: "Active" | "Inactive";
  concessionId?: string | null;
  concessionAmount?: number;
  academicYear?: string;
  schoolFeePaid?: number;
  schoolFeeTotal?: number;
  busFeePaid?: number;
  busFeeTotal?: number;
}

export type TransactionType = "income" | "expense" | "transfer";

export type PaymentMethod = "Cash" | "Bank" | "UPI" | "Cheque";

export type TransactionCategory =
  | "School Fee"
  | "Bus Fee"
  | "Sales"
  | "Voucher"
  | "Transfer"
  | "Other";

export interface Transaction {
  id: string;
  date: string;
  particulars: string;
  category: TransactionCategory;
  type: TransactionType;
  method: PaymentMethod;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  referenceId?: string;
}

export interface MonthlyCollection {
  month: string;
  schoolFee: number;
  busFee: number;
  storeSales: number;
}

export interface CollectionSummaryData {
  schoolFee: number;
  busFee: number;
  storeSales: number;
  voucherExpenses: number;
}

export type FeeFrequency = "Monthly" | "Term-wise" | "Annual" | "One-time";

export interface FeeCategory {
  id: string;
  name: string;
  description: string;
  frequency: FeeFrequency;
  status: "Active" | "Inactive";
}

export interface FeeStructure {
  id: string;
  academicYear: string;
  className: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  frequency: FeeFrequency;
  dueDate: string;
}

export interface Concession {
  id: string;
  name: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  applicableCategoryIds: string[];
  applicableClasses: string[];
  status: "Active" | "Inactive";
  description?: string;
}

export interface FeePayment {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  division: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNo?: string;
  remarks?: string;
  category: string;
  academicYear: string;
  months?: string[];
  status: "Completed";
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  driverName?: string;
  driverPhone?: string;
  monthlyFee: number;
  termFee?: number;
  assignedStudents: number;
  status: "Active" | "Inactive";
}

export interface BusPayment {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  division: string;
  routeId: string;
  routeName: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNo?: string;
  remarks?: string;
  status: "Completed";
}

export interface Product {
  id: string;
  name: string;
  category: "Stationery" | "Books" | "Uniform" | "Accessories" | "Other";
  price: number;
  stock: number;
  status: "Active" | "Inactive";
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  remarks?: string;
  status: "Completed";
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  date: string;
  categoryId: string;
  categoryName: string;
  description: string;
  paidTo: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  remarks?: string;
  preparedBy: string;
  status: "Completed";
}

export interface FundTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromAccount: "Cash" | "Bank";
  toAccount: "Cash" | "Bank";
  amount: number;
  referenceNo?: string;
  description: string;
  transferredBy: string;
  status: "Completed";
}

export interface GeneralSettings {
  schoolName: string;
  schoolAddress: string;
  phone: string;
  email: string;
  logoText: string;
  academicYear: string;
  financialYear: string;
  currency: string;
  receiptFooterText: string;
}

export interface BankAccountDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolder: string;
}

export interface PaymentSettings {
  allowedPaymentModes: PaymentMethod[];
  defaultPaymentMode: PaymentMethod;
  bankAccount: BankAccountDetails;
  openingCashBalance: number;
  openingBankBalance: number;
  upiId?: string;
}

export type ModulePermission =
  | "students"
  | "schoolFee"
  | "busFee"
  | "storeSales"
  | "vouchers"
  | "finance"
  | "reports"
  | "settings";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Accounts Officer" | "Transport In-Charge" | "Store Clerk";
  status: "Active" | "Inactive";
  phone: string;
  permissions: ModulePermission[];
}
