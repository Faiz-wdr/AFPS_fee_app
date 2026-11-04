import type { Transaction } from '../types';

export const recentTransactions: Transaction[] = [
  {
    id: "TXN1001",
    date: "2026-11-04",
    particulars: "Muhammed Ayaan",
    category: "School Fee",
    type: "income",
    method: "Cash",
    amount: 1500,
    status: "Completed"
  },
  {
    id: "TXN1002",
    date: "2026-11-04",
    particulars: "Amina Fathima",
    category: "School Fee",
    type: "income",
    method: "Bank",
    amount: 2000,
    status: "Completed"
  },
  {
    id: "TXN1003",
    date: "2026-11-03",
    particulars: "Bus Route 02 Collection",
    category: "Bus Fee",
    type: "income",
    method: "Cash",
    amount: 12000,
    status: "Completed"
  },
  {
    id: "TXN1004",
    date: "2026-11-03",
    particulars: "School Store Sales",
    category: "Sales",
    type: "income",
    method: "Cash",
    amount: 3500,
    status: "Completed"
  },
  {
    id: "TXN1005",
    date: "2026-11-02",
    particulars: "Electricity Bill",
    category: "Voucher",
    type: "expense",
    method: "Bank",
    amount: 8500,
    status: "Completed"
  },
  {
    id: "TXN1006",
    date: "2026-11-02",
    particulars: "Abdul Hadi",
    category: "School Fee",
    type: "income",
    method: "Bank",
    amount: 1500,
    status: "Completed"
  },
  {
    id: "TXN1007",
    date: "2026-11-01",
    particulars: "Office Stationary Supplies",
    category: "Voucher",
    type: "expense",
    method: "Cash",
    amount: 4200,
    status: "Completed"
  },
  {
    id: "TXN1008",
    date: "2026-11-01",
    particulars: "Fathima Rania",
    category: "School Fee",
    type: "income",
    method: "UPI",
    amount: 2000,
    status: "Completed"
  }
];
