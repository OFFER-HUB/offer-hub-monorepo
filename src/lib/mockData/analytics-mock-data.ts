export interface PaymentMetric {
  label: string;
  amount: number;
  variant?: 'primary' | 'secondary';
}

export const requestedPaymentsCards: PaymentMetric[] = [
  { label: 'Requested payment', amount: 487, variant: 'primary' },
  { label: 'Requested payment', amount: 487, variant: 'secondary' },
];

export interface RevenueMetric {
  title: string;
  value: string;
  change?: string; // e.g., +12%
}

export const revenueMetricsMock: RevenueMetric[] = [
  { title: 'Total revenue', value: '$12,450', change: '+8.3%' },
  { title: 'Pending payouts', value: '$1,320' },
  { title: 'Completed invoices', value: '27' },
];


