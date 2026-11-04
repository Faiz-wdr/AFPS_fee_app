import type { CollectionSummaryData, MonthlyCollection } from '../types';

export const collectionSummaryData: CollectionSummaryData = {
  schoolFee: 1245000,
  busFee: 325000,
  storeSales: 84500,
  voucherExpenses: 145000
};

export const monthlyCollections: MonthlyCollection[] = [
  { month: "June", schoolFee: 180000, busFee: 45000, storeSales: 12000 },
  { month: "July", schoolFee: 210000, busFee: 52000, storeSales: 14500 },
  { month: "August", schoolFee: 195000, busFee: 48000, storeSales: 11000 },
  { month: "September", schoolFee: 230000, busFee: 55000, storeSales: 16000 },
  { month: "October", schoolFee: 245000, busFee: 61000, storeSales: 18500 },
  { month: "November", schoolFee: 220000, busFee: 58000, storeSales: 13000 }
];

/**
 * Calculates Financial Overview derived directly from the underlying collection data.
 */
export function getFinancialOverview(data: CollectionSummaryData = collectionSummaryData) {
  const totalIncome = data.schoolFee + data.busFee + data.storeSales;
  const totalExpenses = data.voucherExpenses;
  const netBalance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netBalance
  };
}

/**
 * Calculates collection distribution for the donut chart.
 */
export function getCollectionDistribution(data: CollectionSummaryData = collectionSummaryData) {
  const totalCollections = data.schoolFee + data.busFee + data.storeSales;
  return [
    {
      name: "School Fee",
      value: data.schoolFee,
      percentage: ((data.schoolFee / totalCollections) * 100).toFixed(1),
      color: "#5A54B4"
    },
    {
      name: "Bus Fee",
      value: data.busFee,
      percentage: ((data.busFee / totalCollections) * 100).toFixed(1),
      color: "#8B85E9"
    },
    {
      name: "Store Sales",
      value: data.storeSales,
      percentage: ((data.storeSales / totalCollections) * 100).toFixed(1),
      color: "#249B62"
    }
  ];
}
