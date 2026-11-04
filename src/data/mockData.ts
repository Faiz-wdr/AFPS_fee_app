import type {
  BusRoute,
  BusPayment,
  FeePayment,
  Product,
  SaleTransaction,
  Voucher,
  FeeCategory,
  FeeStructure,
  Concession,
  ExpenseCategory,
  FundTransfer,
  GeneralSettings,
  PaymentSettings,
  StaffUser
} from '../types';

export const initialBusRoutes: BusRoute[] = [
  {
    id: "route-01",
    routeNumber: "Route 01",
    routeName: "Aluva - Kalamassery - Kaloor",
    driverName: "Soman Pillai",
    driverPhone: "9447100001",
    monthlyFee: 1500,
    termFee: 4500,
    assignedStudents: 3,
    status: "Active"
  },
  {
    id: "route-02",
    routeNumber: "Route 02",
    routeName: "Kakkanad - Infopark - Edappally",
    driverName: "Basheer M.",
    driverPhone: "9447100002",
    monthlyFee: 1400,
    termFee: 4200,
    assignedStudents: 4,
    status: "Active"
  },
  {
    id: "route-03",
    routeNumber: "Route 03",
    routeName: "Vyttila - Kadavanthra - Panampilly",
    driverName: "Antony Joseph",
    driverPhone: "9447100003",
    monthlyFee: 1600,
    termFee: 4800,
    assignedStudents: 3,
    status: "Active"
  },
  {
    id: "route-04",
    routeNumber: "Route 04",
    routeName: "Tripunithura - Maradu - Thevara",
    driverName: "Radhakrishnan P.",
    driverPhone: "9447100004",
    monthlyFee: 1500,
    termFee: 4500,
    assignedStudents: 2,
    status: "Active"
  },
  {
    id: "route-05",
    routeNumber: "Route 05",
    routeName: "Fort Kochi - Mattancherry - Thopumpady",
    driverName: "Haneefa K.A.",
    driverPhone: "9447100005",
    monthlyFee: 1700,
    termFee: 5100,
    assignedStudents: 0,
    status: "Active"
  },
  {
    id: "route-06",
    routeNumber: "Route 06",
    routeName: "Cherai - Paravur - Varapuzha",
    driverName: "Gireesh Kumar",
    driverPhone: "9447100006",
    monthlyFee: 1800,
    termFee: 5400,
    assignedStudents: 0,
    status: "Active"
  }
];

export const initialFeeCategories: FeeCategory[] = [
  { id: "cat-01", name: "Tuition Fee", description: "Regular academic instruction fee", frequency: "Monthly", status: "Active" },
  { id: "cat-02", name: "Admission Fee", description: "One-time admission processing fee", frequency: "One-time", status: "Active" },
  { id: "cat-03", name: "Examination Fee", description: "Terminal and mid-term exam fees", frequency: "Term-wise", status: "Active" },
  { id: "cat-04", name: "Library Fee", description: "Library resource and digital portal access", frequency: "Annual", status: "Active" },
  { id: "cat-05", name: "Development Fee", description: "Campus infrastructure & laboratory fee", frequency: "Annual", status: "Active" },
  { id: "cat-06", name: "Computer Lab Fee", description: "IT lab access and smart class fee", frequency: "Term-wise", status: "Active" }
];

export const initialFeeStructures: FeeStructure[] = [
  { id: "fs-01", academicYear: "2026-2027", className: "Class 1", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 1100, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-02", academicYear: "2026-2027", className: "Class 2", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 1200, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-03", academicYear: "2026-2027", className: "Class 3", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 1300, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-04", academicYear: "2026-2027", className: "Class 4", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 1400, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-05", academicYear: "2026-2027", className: "Class 5", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 1500, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-06", academicYear: "2026-2027", className: "Class 6", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 1800, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-07", academicYear: "2026-2027", className: "Class 7", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 2000, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-08", academicYear: "2026-2027", className: "Class 8", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 2200, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-09", academicYear: "2026-2027", className: "Class 9", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 2500, frequency: "Monthly", dueDate: "10th of every month" },
  { id: "fs-10", academicYear: "2026-2027", className: "Class 10", categoryId: "cat-01", categoryName: "Tuition Fee", amount: 2800, frequency: "Monthly", dueDate: "10th of every month" }
];

export const initialConcessions: Concession[] = [
  {
    id: "conc-01",
    name: "Staff Ward Discount",
    discountType: "Percentage",
    discountValue: 25,
    applicableCategoryIds: ["cat-01"],
    applicableClasses: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    status: "Active",
    description: "25% concession for children of permanent school staff"
  },
  {
    id: "conc-02",
    name: "Sibling Concession",
    discountType: "Fixed",
    discountValue: 300,
    applicableCategoryIds: ["cat-01"],
    applicableClasses: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    status: "Active",
    description: "₹300 monthly discount for younger sibling"
  },
  {
    id: "conc-03",
    name: "Merit Scholarship",
    discountType: "Percentage",
    discountValue: 50,
    applicableCategoryIds: ["cat-01"],
    applicableClasses: ["Class 8", "Class 9", "Class 10"],
    status: "Active",
    description: "50% academic excellence waiver"
  }
];

export const initialProducts: Product[] = [
  { id: "prod-01", name: "Four-Rule Notebook 192 Pgs", category: "Stationery", price: 50, stock: 450, status: "Active" },
  { id: "prod-02", name: "Single-Rule Notebook 192 Pgs", category: "Stationery", price: 50, stock: 520, status: "Active" },
  { id: "prod-03", name: "Gel Pen (Blue/Black)", category: "Stationery", price: 10, stock: 800, status: "Active" },
  { id: "prod-04", name: "Graph Book 64 Pgs", category: "Stationery", price: 35, stock: 180, status: "Active" },
  { id: "prod-05", name: "HB Drawing Pencil Set", category: "Stationery", price: 40, stock: 260, status: "Active" },
  { id: "prod-06", name: "School Student Diary 2026-27", category: "Books", price: 100, stock: 320, status: "Active" },
  { id: "prod-07", name: "Junior Uniform Set (Boys)", category: "Uniform", price: 650, stock: 85, status: "Active" },
  { id: "prod-08", name: "Junior Uniform Set (Girls)", category: "Uniform", price: 650, stock: 90, status: "Active" },
  { id: "prod-09", name: "Senior Uniform Blazer", category: "Uniform", price: 1200, stock: 40, status: "Active" },
  { id: "prod-10", name: "AFPS Branded Ergonomic School Bag", category: "Accessories", price: 750, stock: 110, status: "Active" },
  { id: "prod-11", name: "School Identity Card Lanyard", category: "Accessories", price: 50, stock: 300, status: "Active" }
];

export const initialFeePayments: FeePayment[] = [
  {
    id: "FP-1001",
    receiptNumber: "REC-2026-1001",
    studentId: "1",
    studentName: "Muhammed Ayaan",
    admissionNumber: "AFPS001",
    className: "Class 5",
    division: "A",
    date: "2026-11-04",
    amount: 1500,
    method: "Cash",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["November"],
    remarks: "Full monthly tuition paid",
    status: "Completed"
  },
  {
    id: "FP-1002",
    receiptNumber: "REC-2026-1002",
    studentId: "2",
    studentName: "Amina Fathima",
    admissionNumber: "AFPS002",
    className: "Class 6",
    division: "B",
    date: "2026-11-04",
    amount: 2000,
    method: "Bank",
    referenceNo: "HDFC9823412",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["October"],
    remarks: "Bank transfer via netbanking",
    status: "Completed"
  },
  {
    id: "FP-1003",
    receiptNumber: "REC-2026-1003",
    studentId: "3",
    studentName: "Fathima Rania",
    admissionNumber: "AFPS003",
    className: "Class 7",
    division: "A",
    date: "2026-11-03",
    amount: 2000,
    method: "UPI",
    referenceNo: "UPI2638472910",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["November"],
    remarks: "Google Pay payment",
    status: "Completed"
  },
  {
    id: "FP-1004",
    receiptNumber: "REC-2026-1004",
    studentId: "4",
    studentName: "Rithvik Menon",
    admissionNumber: "AFPS004",
    className: "Class 4",
    division: "A",
    date: "2026-11-03",
    amount: 1400,
    method: "Cash",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["November"],
    remarks: "Cash counter payment",
    status: "Completed"
  },
  {
    id: "FP-1005",
    receiptNumber: "REC-2026-1005",
    studentId: "5",
    studentName: "Ananya Nair",
    admissionNumber: "AFPS005",
    className: "Class 8",
    division: "B",
    date: "2026-11-02",
    amount: 2200,
    method: "Bank",
    referenceNo: "SBI384729101",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["November"],
    remarks: "Direct NEFT credit",
    status: "Completed"
  },
  {
    id: "FP-1006",
    receiptNumber: "REC-2026-1006",
    studentId: "7",
    studentName: "Abdul Hadi",
    admissionNumber: "AFPS007",
    className: "Class 9",
    division: "A",
    date: "2026-11-02",
    amount: 1500,
    method: "Bank",
    referenceNo: "ICICI1928374",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["Part payment"],
    remarks: "Partial installment",
    status: "Completed"
  },
  {
    id: "FP-1007",
    receiptNumber: "REC-2026-1007",
    studentId: "9",
    studentName: "Joel Mathew",
    admissionNumber: "AFPS009",
    className: "Class 10",
    division: "A",
    date: "2026-11-01",
    amount: 2800,
    method: "Cash",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["November"],
    remarks: "Received at counter",
    status: "Completed"
  },
  {
    id: "FP-1008",
    receiptNumber: "REC-2026-1008",
    studentId: "11",
    studentName: "Pranav Pillai",
    admissionNumber: "AFPS011",
    className: "Class 1",
    division: "A",
    date: "2026-11-01",
    amount: 1100,
    method: "Cash",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["November"],
    remarks: "Full term payment",
    status: "Completed"
  },
  {
    id: "FP-1009",
    receiptNumber: "REC-2026-1009",
    studentId: "13",
    studentName: "Farhan Farooq",
    admissionNumber: "AFPS013",
    className: "Class 8",
    division: "A",
    date: "2026-10-31",
    amount: 2200,
    method: "Bank",
    referenceNo: "AXIS8372619",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["October"],
    remarks: "Cleared outstanding",
    status: "Completed"
  },
  {
    id: "FP-1010",
    receiptNumber: "REC-2026-1010",
    studentId: "15",
    studentName: "Gautham Krishna",
    admissionNumber: "AFPS015",
    className: "Class 6",
    division: "A",
    date: "2026-10-30",
    amount: 1800,
    method: "Cash",
    category: "School Fee",
    academicYear: "2026-2027",
    months: ["October"],
    remarks: "Quarter payment",
    status: "Completed"
  }
];

export const initialBusPayments: BusPayment[] = [
  {
    id: "BP-1001",
    receiptNumber: "BUS-2026-1001",
    studentId: "1",
    studentName: "Muhammed Ayaan",
    admissionNumber: "AFPS001",
    className: "Class 5",
    division: "A",
    routeId: "route-01",
    routeName: "Aluva - Kalamassery - Kaloor",
    date: "2026-11-04",
    amount: 1500,
    method: "Cash",
    remarks: "November bus fare",
    status: "Completed"
  },
  {
    id: "BP-1002",
    receiptNumber: "BUS-2026-1002",
    studentId: "3",
    studentName: "Fathima Rania",
    admissionNumber: "AFPS003",
    className: "Class 7",
    division: "A",
    routeId: "route-03",
    routeName: "Vyttila - Kadavanthra - Panampilly",
    date: "2026-11-03",
    amount: 1600,
    method: "Bank",
    referenceNo: "HDFC938472",
    remarks: "Netbanking transfer",
    status: "Completed"
  },
  {
    id: "BP-1003",
    receiptNumber: "BUS-2026-1003",
    studentId: "4",
    studentName: "Rithvik Menon",
    admissionNumber: "AFPS004",
    className: "Class 4",
    division: "A",
    routeId: "route-02",
    routeName: "Kakkanad - Infopark - Edappally",
    date: "2026-11-03",
    amount: 1400,
    method: "Cash",
    remarks: "Route 02 cash receipt",
    status: "Completed"
  },
  {
    id: "BP-1004",
    receiptNumber: "BUS-2026-1004",
    studentId: "8",
    studentName: "Diya Suresh",
    admissionNumber: "AFPS008",
    className: "Class 2",
    division: "B",
    routeId: "route-04",
    routeName: "Tripunithura - Maradu - Thevara",
    date: "2026-11-02",
    amount: 1500,
    method: "Cash",
    remarks: "November conveyance",
    status: "Completed"
  },
  {
    id: "BP-1005",
    receiptNumber: "BUS-2026-1005",
    studentId: "9",
    studentName: "Joel Mathew",
    admissionNumber: "AFPS009",
    className: "Class 10",
    division: "A",
    routeId: "route-02",
    routeName: "Kakkanad - Infopark - Edappally",
    date: "2026-11-02",
    amount: 1400,
    method: "Bank",
    referenceNo: "SBI9182736",
    remarks: "Online payment",
    status: "Completed"
  },
  {
    id: "BP-1006",
    receiptNumber: "BUS-2026-1006",
    studentId: "11",
    studentName: "Pranav Pillai",
    admissionNumber: "AFPS011",
    className: "Class 1",
    division: "A",
    routeId: "route-01",
    routeName: "Aluva - Kalamassery - Kaloor",
    date: "2026-11-01",
    amount: 1500,
    method: "Cash",
    remarks: "Received at counter",
    status: "Completed"
  },
  {
    id: "BP-1007",
    receiptNumber: "BUS-2026-1007",
    studentId: "12",
    studentName: "Devika Rajan",
    admissionNumber: "AFPS012",
    className: "Class 5",
    division: "B",
    routeId: "route-03",
    routeName: "Vyttila - Kadavanthra - Panampilly",
    date: "2026-11-01",
    amount: 1600,
    method: "Cash",
    remarks: "November conveyance",
    status: "Completed"
  },
  {
    id: "BP-1008",
    receiptNumber: "BUS-2026-1008",
    studentId: "15",
    studentName: "Gautham Krishna",
    admissionNumber: "AFPS015",
    className: "Class 6",
    division: "A",
    routeId: "route-04",
    routeName: "Tripunithura - Maradu - Thevara",
    date: "2026-10-31",
    amount: 1500,
    method: "Bank",
    referenceNo: "ICICI837261",
    remarks: "Bank credit",
    status: "Completed"
  },
  {
    id: "BP-1009",
    receiptNumber: "BUS-2026-1009",
    studentId: "17",
    studentName: "Meera Nambiar",
    admissionNumber: "AFPS017",
    className: "Class 9",
    division: "B",
    routeId: "route-01",
    routeName: "Aluva - Kalamassery - Kaloor",
    date: "2026-10-30",
    amount: 1500,
    method: "Cash",
    remarks: "October receipt",
    status: "Completed"
  },
  {
    id: "BP-1010",
    receiptNumber: "BUS-2026-1010",
    studentId: "19",
    studentName: "Keerthana S.",
    admissionNumber: "AFPS019",
    className: "Class 2",
    division: "A",
    routeId: "route-03",
    routeName: "Vyttila - Kadavanthra - Panampilly",
    date: "2026-10-29",
    amount: 1600,
    method: "Cash",
    remarks: "Counter collection",
    status: "Completed"
  }
];

export const initialSales: SaleTransaction[] = [
  {
    id: "SALE-1001",
    receiptNumber: "STR-2026-1001",
    date: "2026-11-04",
    items: [
      { productId: "prod-01", productName: "Four-Rule Notebook 192 Pgs", quantity: 4, unitPrice: 50, total: 200 },
      { productId: "prod-03", productName: "Gel Pen (Blue/Black)", quantity: 5, unitPrice: 10, total: 50 }
    ],
    subtotal: 250,
    discount: 0,
    totalAmount: 250,
    paymentMethod: "Cash",
    customerName: "Muhammed Ayaan (Class 5A)",
    remarks: "Term notebooks",
    status: "Completed"
  },
  {
    id: "SALE-1002",
    receiptNumber: "STR-2026-1002",
    date: "2026-11-04",
    items: [
      { productId: "prod-07", productName: "Junior Uniform Set (Boys)", quantity: 2, unitPrice: 650, total: 1300 },
      { productId: "prod-11", productName: "School Identity Card Lanyard", quantity: 1, unitPrice: 50, total: 50 }
    ],
    subtotal: 1350,
    discount: 50,
    totalAmount: 1300,
    paymentMethod: "Bank",
    customerName: "Sreejith Menon (Parent)",
    remarks: "Uniform bundle",
    status: "Completed"
  },
  {
    id: "SALE-1003",
    receiptNumber: "STR-2026-1003",
    date: "2026-11-03",
    items: [
      { productId: "prod-06", productName: "School Student Diary 2026-27", quantity: 1, unitPrice: 100, total: 100 },
      { productId: "prod-02", productName: "Single-Rule Notebook 192 Pgs", quantity: 6, unitPrice: 50, total: 300 }
    ],
    subtotal: 400,
    discount: 0,
    totalAmount: 400,
    paymentMethod: "Cash",
    customerName: "Amina Fathima (Class 6B)",
    remarks: "Diary & books",
    status: "Completed"
  },
  {
    id: "SALE-1004",
    receiptNumber: "STR-2026-1004",
    date: "2026-11-03",
    items: [
      { productId: "prod-10", productName: "AFPS Branded Ergonomic School Bag", quantity: 1, unitPrice: 750, total: 750 }
    ],
    subtotal: 750,
    discount: 0,
    totalAmount: 750,
    paymentMethod: "Cash",
    customerName: "Kurian Thomas (Parent)",
    remarks: "School bag purchase",
    status: "Completed"
  },
  {
    id: "SALE-1005",
    receiptNumber: "STR-2026-1005",
    date: "2026-11-02",
    items: [
      { productId: "prod-04", productName: "Graph Book 64 Pgs", quantity: 2, unitPrice: 35, total: 70 },
      { productId: "prod-05", productName: "HB Drawing Pencil Set", quantity: 2, unitPrice: 40, total: 80 }
    ],
    subtotal: 150,
    discount: 0,
    totalAmount: 150,
    paymentMethod: "Cash",
    customerName: "Nihal Krishna (Class 3A)",
    remarks: "Stationery kit",
    status: "Completed"
  },
  {
    id: "SALE-1006",
    receiptNumber: "STR-2026-1006",
    date: "2026-11-02",
    items: [
      { productId: "prod-08", productName: "Junior Uniform Set (Girls)", quantity: 1, unitPrice: 650, total: 650 }
    ],
    subtotal: 650,
    discount: 0,
    totalAmount: 650,
    paymentMethod: "Bank",
    customerName: "Noufal P.K. (Parent)",
    remarks: "Replacement uniform",
    status: "Completed"
  },
  {
    id: "SALE-1007",
    receiptNumber: "STR-2026-1007",
    date: "2026-11-01",
    items: [
      { productId: "prod-01", productName: "Four-Rule Notebook 192 Pgs", quantity: 8, unitPrice: 50, total: 400 },
      { productId: "prod-03", productName: "Gel Pen (Blue/Black)", quantity: 10, unitPrice: 10, total: 100 }
    ],
    subtotal: 500,
    discount: 0,
    totalAmount: 500,
    paymentMethod: "Cash",
    customerName: "Abdul Hadi (Class 9A)",
    remarks: "Bulk class notebooks",
    status: "Completed"
  },
  {
    id: "SALE-1008",
    receiptNumber: "STR-2026-1008",
    date: "2026-11-01",
    items: [
      { productId: "prod-09", productName: "Senior Uniform Blazer", quantity: 1, unitPrice: 1200, total: 1200 }
    ],
    subtotal: 1200,
    discount: 0,
    totalAmount: 1200,
    paymentMethod: "Bank",
    customerName: "Mathew Varghese (Parent)",
    remarks: "Class 10 blazer",
    status: "Completed"
  },
  {
    id: "SALE-1009",
    receiptNumber: "STR-2026-1009",
    date: "2026-10-31",
    items: [
      { productId: "prod-05", productName: "HB Drawing Pencil Set", quantity: 4, unitPrice: 40, total: 160 },
      { productId: "prod-04", productName: "Graph Book 64 Pgs", quantity: 4, unitPrice: 35, total: 140 }
    ],
    subtotal: 300,
    discount: 0,
    totalAmount: 300,
    paymentMethod: "Cash",
    customerName: "Diya Suresh (Class 2B)",
    remarks: "Art kit supplies",
    status: "Completed"
  },
  {
    id: "SALE-1010",
    receiptNumber: "STR-2026-1010",
    date: "2026-10-30",
    items: [
      { productId: "prod-06", productName: "School Student Diary 2026-27", quantity: 2, unitPrice: 100, total: 200 }
    ],
    subtotal: 200,
    discount: 0,
    totalAmount: 200,
    paymentMethod: "Cash",
    customerName: "Jayachandran (Parent)",
    remarks: "Diaries for siblings",
    status: "Completed"
  }
];

export const initialExpenseCategories: ExpenseCategory[] = [
  { id: "exp-01", name: "Stationery", description: "Office paper, markers, exam printing", status: "Active" },
  { id: "exp-02", name: "Electricity", description: "KSEB monthly power & grid bills", status: "Active" },
  { id: "exp-03", name: "Maintenance", description: "Plumbing, electrical, desk repairs", status: "Active" },
  { id: "exp-04", name: "Transportation", description: "Bus diesel, fitness check, insurance", status: "Active" },
  { id: "exp-05", name: "Salary", description: "Staff advance, substitute staff honorarium", status: "Active" },
  { id: "exp-06", name: "Office Expenses", description: "Tea, pantry, internet, telephone", status: "Active" },
  { id: "exp-07", name: "Other Expenses", description: "Miscellaneous contingencies", status: "Active" }
];

export const initialVouchers: Voucher[] = [
  {
    id: "VCH-1001",
    voucherNumber: "VCH-2026-1001",
    date: "2026-11-04",
    categoryId: "exp-02",
    categoryName: "Electricity",
    description: "KSEB electricity bill for campus primary block (Consumer #92837)",
    paidTo: "Kerala State Electricity Board (KSEB)",
    amount: 8500,
    paymentMethod: "Bank",
    referenceNo: "NEFT8392019",
    remarks: "Electricity bill cleared on time",
    preparedBy: "Accounts Officer",
    status: "Completed"
  },
  {
    id: "VCH-1002",
    voucherNumber: "VCH-2026-1002",
    date: "2026-11-04",
    categoryId: "exp-01",
    categoryName: "Stationery",
    description: "A4 paper reams (20 bundles) for term exams printing",
    paidTo: "Modern Stationers & Printers",
    amount: 4200,
    paymentMethod: "Cash",
    remarks: "Cash paid on delivery with tax invoice",
    preparedBy: "Store In-charge",
    status: "Completed"
  },
  {
    id: "VCH-1003",
    voucherNumber: "VCH-2026-1003",
    date: "2026-11-03",
    categoryId: "exp-04",
    categoryName: "Transportation",
    description: "Diesel fuel refill for Route 01 & Route 02 school buses",
    paidTo: "BPCL Fuel Station, Kalamassery",
    amount: 14500,
    paymentMethod: "Bank",
    referenceNo: "POS9382710",
    remarks: "Monthly fleet fueling",
    preparedBy: "Transport Supervisor",
    status: "Completed"
  },
  {
    id: "VCH-1004",
    voucherNumber: "VCH-2026-1004",
    date: "2026-11-03",
    categoryId: "exp-06",
    categoryName: "Office Expenses",
    description: "BSNL Fiber broadband high-speed internet subscription for Nov 2026",
    paidTo: "BSNL Kerala Telecom",
    amount: 2400,
    paymentMethod: "Bank",
    referenceNo: "UPI39281729",
    remarks: "School office & lab internet",
    preparedBy: "IT Administrator",
    status: "Completed"
  },
  {
    id: "VCH-1005",
    voucherNumber: "VCH-2026-1005",
    date: "2026-11-02",
    categoryId: "exp-03",
    categoryName: "Maintenance",
    description: "Classroom ceiling fan repairs and new switchboards",
    paidTo: "Royal Electricals & Services",
    amount: 3600,
    paymentMethod: "Cash",
    remarks: "Electrical overhaul in Block B",
    preparedBy: "Estate Manager",
    status: "Completed"
  },
  {
    id: "VCH-1006",
    voucherNumber: "VCH-2026-1006",
    date: "2026-11-02",
    categoryId: "exp-07",
    categoryName: "Other Expenses",
    description: "Drinking water RO purifier filter cartridge replacements",
    paidTo: "Pure Aqua Solutions",
    amount: 2800,
    paymentMethod: "Cash",
    remarks: "Quarterly filter replacement",
    preparedBy: "Estate Manager",
    status: "Completed"
  },
  {
    id: "VCH-1007",
    voucherNumber: "VCH-2026-1007",
    date: "2026-11-01",
    categoryId: "exp-05",
    categoryName: "Salary",
    description: "Guest lecture honorarium for Career Guidance workshop",
    paidTo: "Prof. Narayanan Namboothiri",
    amount: 5000,
    paymentMethod: "Bank",
    referenceNo: "RTGS9281029",
    remarks: "Career development workshop",
    preparedBy: "Principal",
    status: "Completed"
  },
  {
    id: "VCH-1008",
    voucherNumber: "VCH-2026-1008",
    date: "2026-11-01",
    categoryId: "exp-04",
    categoryName: "Transportation",
    description: "Fitness certification & RTO inspection fees for Bus Route 03",
    paidTo: "Motor Vehicles Dept, Ernakulam",
    amount: 3200,
    paymentMethod: "Bank",
    referenceNo: "MVD982341",
    remarks: "Annual fitness renewal",
    preparedBy: "Transport Supervisor",
    status: "Completed"
  },
  {
    id: "VCH-1009",
    voucherNumber: "VCH-2026-1009",
    date: "2026-10-31",
    categoryId: "exp-01",
    categoryName: "Stationery",
    description: "Printer toner cartridges for administrative office laser printers",
    paidTo: "Canon Document Solutions",
    amount: 6200,
    paymentMethod: "Bank",
    referenceNo: "AXIS8372619",
    remarks: "Black toner cartridge set",
    preparedBy: "Accounts Officer",
    status: "Completed"
  },
  {
    id: "VCH-1010",
    voucherNumber: "VCH-2026-1010",
    date: "2026-10-30",
    categoryId: "exp-06",
    categoryName: "Office Expenses",
    description: "Staff tea, coffee and refreshments for October 2026 monthly staff meeting",
    paidTo: "Annapoorna Caterers",
    amount: 1800,
    paymentMethod: "Cash",
    remarks: "Monthly staff review refreshments",
    preparedBy: "Office Assistant",
    status: "Completed"
  }
];

export const initialFundTransfers: FundTransfer[] = [
  {
    id: "TRF-1001",
    transferNumber: "TRF-2026-1001",
    date: "2026-11-03",
    fromAccount: "Cash",
    toAccount: "Bank",
    amount: 25000,
    referenceNo: "CHQ-892102",
    description: "Daily counter cash deposit into SBI school current account",
    transferredBy: "Accounts Officer",
    status: "Completed"
  },
  {
    id: "TRF-1002",
    transferNumber: "TRF-2026-1002",
    date: "2026-11-02",
    fromAccount: "Bank",
    toAccount: "Cash",
    amount: 10000,
    referenceNo: "ATM-WITHDRAW-482",
    description: "Petty cash replenishment for administrative expenses",
    transferredBy: "Accounts Officer",
    status: "Completed"
  },
  {
    id: "TRF-1003",
    transferNumber: "TRF-2026-1003",
    date: "2026-10-31",
    fromAccount: "Cash",
    toAccount: "Bank",
    amount: 35000,
    referenceNo: "DEP-SLIP-4019",
    description: "Month-end bookstore and tuition fee cash collections deposited",
    transferredBy: "Accounts Officer",
    status: "Completed"
  },
  {
    id: "TRF-1004",
    transferNumber: "TRF-2026-1004",
    date: "2026-10-25",
    fromAccount: "Bank",
    toAccount: "Cash",
    amount: 15000,
    referenceNo: "CHQ-892095",
    description: "Cash withdrawal for sports day logistics and stationery purchases",
    transferredBy: "Accounts Officer",
    status: "Completed"
  }
];

export const initialGeneralSettings: GeneralSettings = {
  schoolName: "Al-Falah Public School",
  schoolAddress: "Campus Road, Malappuram, Kerala 676505",
  phone: "+91 98470 12345",
  email: "office@al-falahschool.edu.in",
  logoText: "AFPS",
  academicYear: "2026-2027",
  financialYear: "2026-2027",
  currency: "INR (₹)",
  receiptFooterText: "Thank you for your payment. For fee queries, contact the school accounts department."
};

export const initialPaymentSettings: PaymentSettings = {
  allowedPaymentModes: ["Cash", "Bank", "UPI", "Cheque"],
  defaultPaymentMode: "Cash",
  bankAccount: {
    bankName: "State Bank of India",
    accountNumber: "39281048291",
    ifscCode: "SBIN0001234",
    branchName: "Civil Station Branch",
    accountHolder: "Al-Falah Public School Society"
  },
  openingCashBalance: 75000,
  openingBankBalance: 450000,
  upiId: "afps.fees@sbi"
};

export const initialStaffUsers: StaffUser[] = [
  {
    id: "staff-01",
    name: "Faiz Rahman",
    email: "faiz.admin@afps.edu.in",
    role: "Admin",
    status: "Active",
    phone: "+91 98470 00001",
    permissions: ["students", "schoolFee", "busFee", "storeSales", "vouchers", "finance", "reports", "settings"]
  },
  {
    id: "staff-02",
    name: "Aisha Siddiqua",
    email: "aisha.accounts@afps.edu.in",
    role: "Accounts Officer",
    status: "Active",
    phone: "+91 98470 00002",
    permissions: ["schoolFee", "vouchers", "finance", "reports"]
  },
  {
    id: "staff-03",
    name: "Kareem Usman",
    email: "kareem.transport@afps.edu.in",
    role: "Transport In-Charge",
    status: "Active",
    phone: "+91 98470 00003",
    permissions: ["students", "busFee", "reports"]
  },
  {
    id: "staff-04",
    name: "Sunil Kumar",
    email: "sunil.store@afps.edu.in",
    role: "Store Clerk",
    status: "Active",
    phone: "+91 98470 00004",
    permissions: ["storeSales"]
  }
];

