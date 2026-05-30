"use client";

interface Transaction {
  id: string;
  type: "withdrawal" | "deposit";
  amount: string;
  destination?: string;
  destinationType?: "stellar" | "airtm";
  status: "WITHDRAWAL_PENDING" | "WITHDRAWAL_COMPLETED" | "WITHDRAWAL_FAILED" | "DEPOSIT_COMPLETED";
  createdAt: string;
}

const STATUS_CONFIG: Record<Transaction["status"], { label: string; color: string; dot: string }> = {
  WITHDRAWAL_PENDING: { label: "Pending", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", dot: "bg-amber-500" },
  WITHDRAWAL_COMPLETED: { label: "Completed", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", dot: "bg-green-500" },
  WITHDRAWAL_FAILED: { label: "Failed", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", dot: "bg-red-500" },
  DEPOSIT_COMPLETED: { label: "Completed", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", dot: "bg-green-500" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function truncate(str: string, n: number) {
  if (!str) return "";
  return str.length > n ? `${str.slice(0, 8)}...${str.slice(-6)}` : str;
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-sunken)] flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">No transactions yet. Your history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-bg-sunken)]">
      {transactions.map((tx) => {
        const isWithdrawal = tx.type === "withdrawal";
        const statusConfig = STATUS_CONFIG[tx.status];
        return (
          <div key={tx.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isWithdrawal ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"}`}>
              {isWithdrawal ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l-4 4m0 0l4 4m-4-4h18" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">{tx.type}</span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
              {tx.destination && (
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5 truncate">
                  → {truncate(tx.destination, 20)} {tx.destinationType && <span className="font-sans opacity-70">({tx.destinationType})</span>}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(tx.createdAt)}</p>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-sm font-bold font-mono ${isWithdrawal ? "text-red-500" : "text-green-500"}`}>
                {isWithdrawal ? "-" : "+"}${tx.amount}
              </span>
              <p className="text-xs text-[var(--color-text-muted)]">USDC</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}