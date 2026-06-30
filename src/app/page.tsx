'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiExternalLink } from 'react-icons/fi';
import CompanySearch from '@/components/edgar/CompanySearch';
import FilingTimeline from '@/components/edgar/FilingTimeline';
import CompanyFinancials from '@/components/edgar/CompanyFinancials';
import InsiderTransactions from '@/components/edgar/InsiderTransactions';
import RecentFilings from '@/components/edgar/RecentFilings';
import RiskAnalysis from '@/components/edgar/RiskAnalysis';
import { useEdgarCompanies, useSelectedCompany } from '@/hooks/useEdgarData';

export default function EdgarAnalyzerPage() {
  const { companies, isLoading, loadCompany } = useEdgarCompanies();
  const [selectedTicker, setSelectedTicker] = useState('AAPL');

  const selectedData = useSelectedCompany(companies, selectedTicker);
  const loadedCount = companies.filter(c => c.data).length;
  const totalFilings = companies.reduce(
    (sum, c) => sum + (c.data?.metadata?.recent_filings?.length || 0),
    0
  );
  const totalInsider = companies.reduce(
    (sum, c) => sum + (c.data?.metadata?.insider_transactions?.length || 0),
    0
  );

  const handleSearch = (query: string) => {
    loadCompany(query, query);
    setSelectedTicker(query);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#E5D5C5]">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <a href="https://dataville.com" className="flex items-center gap-3">
            <Image src="/Mailbox_Full (2).svg" alt="Dataville icon" width={24} height={24} />
            <Image src="/dataville-logo.svg" alt="Dataville" width={100} height={18} />
          </a>
          <a
            href="https://dataville.com"
            className="text-sm font-medium text-maroon hover:underline flex items-center gap-1"
          >
            dataville.com <FiExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-maroon">SEC Filing Analyzer</h1>
              <p className="mt-1 text-sm text-maroon/70">
                Financial filings, insider trades, and company fundamentals from SEC EDGAR
              </p>
              <p className="mt-0.5 text-xs text-maroon/50">
                Data source: Dataville API · {companies.length} companies tracked
              </p>
            </div>

            <div className="flex gap-6 text-center flex-shrink-0">
              <div>
                <p className="text-2xl font-bold text-maroon">{loadedCount}</p>
                <p className="text-xs text-maroon/50">Companies</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-maroon">{totalFilings}</p>
                <p className="text-xs text-maroon/50">Filings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-maroon">{totalInsider}</p>
                <p className="text-xs text-maroon/50">Insider Txns</p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white divide-y divide-maroon/10">
          <div className="px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-maroon/40 mb-1">Featured use case</p>
            <h2 className="text-base font-bold text-maroon">SEC EDGAR Financial Analysis</h2>
            <p className="mt-1.5 text-sm text-maroon/70 leading-relaxed">
              Query SEC EDGAR filings through the Dataville API and receive structured financial data,
              insider trading records, and filing metadata — ready for investment research, compliance
              monitoring, or building financial dashboards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-maroon/10">
            <div className="px-6 py-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-maroon/40 mb-3">Why use Dataville</h3>
              <ul className="space-y-2.5 text-sm text-maroon/70">
                {[
                  'One API call returns structured financials, insider trades, and filing metadata',
                  'XBRL facts parsed into clean JSON — no XML wrangling needed',
                  'Form 4 insider transactions automatically extracted and normalized',
                  'Search by ticker or company name across all SEC registrants',
                ].map(item => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-maroon/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-maroon/40 mb-3">Data source</h3>
              <div className="text-sm text-maroon/70 space-y-3">
                <p>
                  <span className="font-medium text-maroon">SEC EDGAR</span> — the U.S. Securities and
                  Exchange Commission&apos;s public filing system, accessed via the Dataville API.
                </p>
                <ul className="space-y-2">
                  {[
                    ['Filings', '10-K, 10-Q, 8-K, DEF 14A, Form 4, and more'],
                    ['Financials', 'Revenue, net income, assets, liabilities, equity, cash'],
                    ['Insider data', 'Officer/director transactions from Form 4 filings'],
                  ].map(([label, value]) => (
                    <li key={label} className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-maroon/40 flex-shrink-0" />
                      <span><span className="font-medium text-maroon">{label}:</span> {value}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://app.dataville.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-maroon hover:underline font-medium"
                >
                  Explore Dataville API
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Company Search + Selector */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
          <h2 className="text-lg font-bold text-maroon mb-3">Company Lookup</h2>
          <CompanySearch onSearch={handleSearch} isLoading={isLoading} />

          <div className="mt-4 flex flex-wrap gap-2">
            {companies.map(c => (
              <button
                key={c.ticker}
                onClick={() => setSelectedTicker(c.ticker)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedTicker === c.ticker
                    ? 'bg-maroon text-white'
                    : 'bg-cream text-maroon hover:bg-maroon/10 border border-[#E5D5C5]'
                }`}
              >
                {c.ticker}
                {c.loading && (
                  <span className="ml-1 inline-block animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filing Timeline */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
          <FilingTimeline companies={companies} isLoading={isLoading} />
        </div>

        {/* Financials + Insider Transactions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
            <CompanyFinancials data={selectedData} isLoading={isLoading} />
          </div>

          <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
            <InsiderTransactions data={selectedData} isLoading={isLoading} />
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
          <RiskAnalysis data={selectedData} companies={companies} isLoading={isLoading} />
        </div>

        {/* Recent Filings */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
          <RecentFilings companies={companies} selectedTicker={selectedTicker} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
