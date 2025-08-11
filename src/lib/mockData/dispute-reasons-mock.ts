export interface DisputeReason {
  id: string;
  label: string;
  description?: string;
}

export const disputeReasons: DisputeReason[] = [
  {
    id: 'payment-issue',
    label: 'Payment Issue',
    description: 'Issues related to payment processing or delays'
  },
  {
    id: 'quality-concerns',
    label: 'Quality Concerns',
    description: 'Work quality does not meet agreed standards'
  },
  {
    id: 'deadline-missed',
    label: 'Deadline Missed',
    description: 'Project deliverables were not completed on time'
  },
  {
    id: 'scope-disagreement',
    label: 'Scope Disagreement',
    description: 'Disagreement about project scope or requirements'
  },
  {
    id: 'communication-issues',
    label: 'Communication Issues',
    description: 'Poor or lack of communication from either party'
  },
  {
    id: 'contract-violation',
    label: 'Contract Violation',
    description: 'Terms of the contract were not followed'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other issues not covered by the above categories'
  }
];

export const getDisputeReasonById = (id: string): DisputeReason | undefined => {
  return disputeReasons.find(reason => reason.id === id);
};

export const getDisputeReasonLabel = (id: string): string => {
  const reason = getDisputeReasonById(id);
  return reason ? reason.label : 'Unknown';
};