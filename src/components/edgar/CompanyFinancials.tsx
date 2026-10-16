'use client';

import { EdgarData, FinancialMetrics } from '@/types/edgar';
import { formatCurrency } from '@/lib/edgarData';

interface CompanyFinancialsProps {
  data: EdgarData | null;
  isLoading: boolean;
}

const METRIC_LABELS: { key: keyof FinancialMetrics; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'net_income', label: 'Net Income' },
  { key: 'gross_profit', label: 'Gross Profit' },
  { key: 'operating_income', label: 'Operating Income' },
  { key: 'total_assets', label: 'Total Assets' },
  { key: 'total_liabilities', label: 'Total Liabilities' },
  { key: 'stockholders_equity', label: "Stockholders' Equity" },
  { key: 'cash', label: 'Cash' },
  { key: 'capex', label: 'Capital Expenditures' },
];

export default function CompanyFinancials({ data, isLoading }: CompanyFinancialsProps) {
  const financials = data?.metadata?.financials;
  const company = data?.metadata?.company_info;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-maroon">Company Financials</h2>
        {company && (
          <p className="text-xs text-maroon/50 mt-1">
            {company.name} ({company.tickers?.join(', ')}) · {company.sicDescription}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon" />
        </div>
      ) : !data ? (
        <div className="h-48 flex items-center justify-center text-sm text-maroon/50">
          Select a company to view financials
        </div>
      ) : (
        <div className="space-y-2">
          {METRIC_LABELS.map(({ key, label }) => {
            const value = financials?.[key];
            return (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-maroon/5 last:border-0">
                <span className="text-sm text-maroon/70">{label}</span>
                <span className="text-sm font-medium text-maroon">{formatCurrency(value)}</span>
              </div>
            );
          })}

          {financials?.form ? (
            // The figures can come from an earlier 10-Q/10-K than the latest
            // filing (an 8-K has none), so name the period they belong to.
            <p className="text-xs text-maroon/40 pt-2">
              From the {financials.form} for the period ending {financials.period}, filed {financials.filed} ·{' '}
              <a href={data.metadata.document_url} target="_blank" rel="noopener noreferrer" className="underline">
                latest filing
              </a>
            </p>
          ) : (
            <p className="text-xs text-maroon/40 pt-2">No XBRL financials in this company&apos;s recent filings.</p>
          )}
        </div>
      )}
    </div>
  );
}
