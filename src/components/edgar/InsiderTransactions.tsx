'use client';

import { EdgarData } from '@/types/edgar';
import { formatTransactionCode } from '@/lib/edgarData';

interface InsiderTransactionsProps {
  data: EdgarData | null;
  isLoading: boolean;
}

export default function InsiderTransactions({ data, isLoading }: InsiderTransactionsProps) {
  const transactions = data?.metadata?.insider_transactions || [];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-maroon">Insider Transactions</h2>
        <p className="text-xs text-maroon/50 mt-1">
          Form 4 filings — officer and director trades
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-maroon/50">
          {data ? 'No insider transactions found' : 'Select a company to view transactions'}
        </div>
      ) : (
        <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
          {transactions.slice(0, 20).map((txn, i) => {
            const isBuy = txn.transactionCode === 'P';
            return (
              <div key={i} className="py-2 border-b border-maroon/5 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-maroon truncate">{txn.owner}</p>
                    <p className="text-xs text-maroon/50">
                      {txn.officerTitle || (txn.isDirector ? 'Director' : 'Officer')}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isBuy
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formatTransactionCode(txn.transactionCode)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-maroon/60">
                  <span>{txn.transactionDate}</span>
                  {txn.sharesTraded > 0 && (
                    <span>{txn.sharesTraded.toLocaleString()} shares</span>
                  )}
                  {txn.pricePerShare > 0 && (
                    <span>@ ${txn.pricePerShare.toFixed(2)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
