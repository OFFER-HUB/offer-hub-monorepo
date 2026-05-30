"use client";

import { useState } from "react";
import { WithdrawalForm } from "./WithdrawalForm";
import { TransactionHistory } from "./TransactionHistory";

type Transaction = {
  id: string;
  type: "withdrawal" | "deposit";
  amount: string;
  destination?: string;
  destinationType?: "stellar" | "airtm";
  status:
    | "WITHDRAWAL_PENDING"
    | "WITHDRAWAL_COMPLETED"
    | "WITHDRAWAL_FAILED"
    | "DEPOSIT_COMPLETED";
  createdAt: string;
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "dep_abc123",
    type: "deposit",
    amount: "500.00",
    status: "DEPOSIT_COMPLETED",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "wd_xyz789",
    type: "withdrawal",
    amount: "100.00",
    destination: "GBXFHQDNJSYCPKMLVQRNFCJDXHZPVAELMBXFHQDNJSYCPKMLVQRNFCAA",
    destinationType: "stellar",
    status: "WITHDRAWAL_COMPLETED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function WalletPage() {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [balance, setBalance] = useState(247.5);
  const [reserved] = useState(52.5);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  const handleWithdrawalSuccess = (tx: {
    id: string;
    amount: string;
    destination: string;
    destinationType: "stellar" | "airtm";
    status: "WITHDRAWAL_PENDING";
    createdAt: string;
  }) => {
    const newTx: Transaction = { ...tx, type: "withdrawal" };
    setTransactions((prev) => [newTx, ...prev]);
    setBalance((prev) => parseFloat((prev - parseFloat(tx.amount)).toFixed(2)));
    setShowWithdrawalForm(false);
    setActiveTab("history");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Wallet</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your USDC balance and withdrawal requests
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-5 border border-[var(--color-bg-sunken)] shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Available Balance
            </p>
            <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
              ${balance.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">USDC</p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-5 border border-[var(--color-bg-sunken)] shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Reserved (Escrow)
            </p>
            <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
              ${reserved.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">USDC</p>
          </div>
        </div>

        {!showWithdrawalForm && (
          <button
            onClick={() => setShowWithdrawalForm(true)}
            disabled={balance <= 0}
            className="w-full mb-6 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="withdraw-button"
            title={balance <= 0 ? "No available balance to withdraw" : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Request Withdrawal
          </button>
        )}

        {showWithdrawalForm && (
          <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-6 mb-6 border border-[var(--color-bg-sunken)] shadow-sm"
            data-testid="withdrawal-form-panel">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                New Withdrawal Request
              </h2>
              <button onClick={() => setShowWithdrawalForm(false)}
                className="w-7 h-7 rounded-full bg-[var(--color-bg-sunken)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <WithdrawalForm
              availableBalance={balance}
              onSuccess={handleWithdrawalSuccess}
              onCancel={() => setShowWithdrawalForm(false)}
            />
          </div>
        )}

        <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-bg-sunken)] shadow-sm overflow-hidden">
          <div className="flex border-b border-[var(--color-bg-sunken)]">
            {(["overview", "history"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] -mb-px"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}>
                {tab === "history" ? "Transaction History" : "Overview"}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-bg-sunken)]">
                  <span className="text-sm text-[var(--color-text-secondary)]">Total Balance</span>
                  <span className="text-sm font-semibold font-mono text-[var(--color-text-primary)]">${(balance + reserved).toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-bg-sunken)]">
                  <span className="text-sm text-[var(--color-text-secondary)]">Available</span>
                  <span className="text-sm font-semibold font-mono text-green-600">${balance.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-bg-sunken)]">
                  <span className="text-sm text-[var(--color-text-secondary)]">Reserved (Escrow)</span>
                  <span className="text-sm font-semibold font-mono text-amber-600">${reserved.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[var(--color-text-secondary)]">Total Transactions</span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{transactions.length}</span>
                </div>
              </div>
            )}
            {activeTab === "history" && <TransactionHistory transactions={transactions} />}
          </div>
        </div>
      </div>
    </div>
  );
}