'use client';

import { FiExternalLink } from 'react-icons/fi';
import { CompanyEntry } from '@/types/edgar';

interface RecentFilingsProps {
  companies: CompanyEntry[];
  selectedTicker: string;
  isLoading: boolean;
}

export default function RecentFilings({ companies, selectedTicker, isLoading }: RecentFilingsProps) {
  const selected = companies.find(c => c.ticker === selectedTicker);
  const filings = selected?.data?.metadata?.recent_filings || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-maroon">Recent Filings</h2>
          <p className="text-xs text-maroon/50 mt-1">
            {selected?.name || selectedTicker} — SEC EDGAR documents
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon" />
        </div>
      ) : filings.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-maroon/50">
          No filings available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5D5C5]">
                <th className="text-left py-2 px-2 text-xs font-semibold text-maroon/50 uppercase tracking-wider">Form</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-maroon/50 uppercase tracking-wider">Filing Date</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-maroon/50 uppercase tracking-wider">Description</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-maroon/50 uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody>
              {filings.slice(0, 15).map((filing, i) => (
                <tr key={i} className="border-b border-maroon/5 last:border-0 hover:bg-cream/50">
                  <td className="py-2 px-2">
                    <span className="px-2 py-0.5 rounded bg-cream text-xs font-medium text-maroon">
                      {filing.formType}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-maroon/70">{filing.filingDate}</td>
                  <td className="py-2 px-2 text-maroon/70 max-w-md truncate">{filing.description || '—'}</td>
                  <td className="py-2 px-2 text-right">
                    {filing.documentUrl && (
                      <a
                        href={filing.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-maroon hover:underline"
                      >
                        View <FiExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
