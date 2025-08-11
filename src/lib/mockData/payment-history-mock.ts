export interface PaymentHistoryItem {
  id: string;
  freelancer: string;
  note: string;
  amount: number; // USD
}

export const paymentHistoryMock: PaymentHistoryItem[] = [
  { id: 'pay-001', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-002', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-003', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-004', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-005', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-006', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-007', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
  { id: 'pay-008', freelancer: 'Alex Smith', note: 'Payment for phase 3', amount: 450 },
];


