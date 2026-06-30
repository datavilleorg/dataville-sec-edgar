'use client';

import { useMemo } from 'react';
import { EdgarData, CompanyEntry } from '@/types/edgar';
import { computeRiskScore, getRiskLevel, RiskSignal, RiskScore } from '@/lib/riskAnalysis';
import { FiAlertTriangle, FiShield, FiTrendingDown } from 'react-icons/fi';

interface RiskAnalysisProps {
  data: EdgarData | null;
  companies: CompanyEntry[];
  isLoading: boolean;
}

function SeverityBadge({ severity }: { severity: RiskSignal['severity'] }) {
  const styles = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function CategoryIcon({ category }: { category: RiskSignal['category'] }) {
  const cls = "h-3.5 w-3.5 flex-shrink-0 mt-0.5";
  switch (category) {
    case 'financial': return <FiTrendingDown className={cls} />;
    case 'insider': return <FiAlertTriangle className={cls} />;
    case 'filing': return <FiShield className={cls} />;
  }
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const level = getRiskLevel(score);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-maroon/70">{label}</span>
        <span className={`font-medium ${level.color}`}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-maroon/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 60 ? 'bg-red-500' : score >= 30 ? 'bg-amber-500' : 'bg-green-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function CompanyRiskSummary({ companies }: { companies: CompanyEntry[] }) {
  const scored = useMemo(() => {
    return companies
      .filter(c => c.data)
      .map(c => ({
        ticker: c.ticker,
        name: c.name,
        risk: computeRiskScore(c.data!),
      }))
      .sort((a, b) => b.risk.overall - a.risk.overall);
  }, [companies]);

  if (scored.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-maroon/10">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-maroon/40 mb-3">
        Risk ranking — all tracked companies
      </h3>
      <div className="space-y-2">
        {scored.map(({ ticker, name, risk }) => {
          const level = getRiskLevel(risk.overall);
          return (
            <div key={ticker} className="flex items-center gap-3">
              <span className="text-sm font-medium text-maroon w-12">{ticker}</span>
              <div className="flex-1 h-2 rounded-full bg-maroon/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    risk.overall >= 60 ? 'bg-red-500' : risk.overall >= 30 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.max(risk.overall, 3)}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-14 text-right ${level.color}`}>
                {risk.overall} / 100
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${level.bgColor} ${level.color}`}>
                {level.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RiskAnalysis({ data, companies, isLoading }: RiskAnalysisProps) {
  const risk: RiskScore | null = useMemo(() => {
    if (!data) return null;
    return computeRiskScore(data);
  }, [data]);

  const companyName = data?.metadata?.company_info?.name || data?.entities?.[0] || 'Company';
  const level = risk ? getRiskLevel(risk.overall) : null;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-maroon">Risk Analysis</h2>
        <p className="text-xs text-maroon/50 mt-1">
          Automated scoring from financials, insider trades, and filing patterns
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon" />
        </div>
      ) : !risk ? (
        <div className="h-48 flex items-center justify-center text-sm text-maroon/50">
          Select a company to view risk analysis
        </div>
      ) : (
        <div>
          {/* Overall score */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${level!.bgColor}`}>
              <span className={`text-2xl font-bold ${level!.color}`}>{risk.overall}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-maroon">{companyName}</p>
              <p className={`text-sm font-semibold ${level!.color}`}>{level!.label} Risk</p>
              <p className="text-xs text-maroon/50">{risk.signals.length} signal(s) detected</p>
            </div>
          </div>

          {/* Category scores */}
          <div className="space-y-3 mb-5">
            <ScoreBar label="Financial Health" score={risk.financial} />
            <ScoreBar label="Insider Activity" score={risk.insider} />
            <ScoreBar label="Filing Patterns" score={risk.filing} />
          </div>

          {/* Signals */}
          {risk.signals.length > 0 ? (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-maroon/40">
                Signals
              </h3>
              {risk.signals.map((signal, i) => (
                <div key={i} className="flex gap-2.5 py-2 border-b border-maroon/5 last:border-0">
                  <CategoryIcon category={signal.category} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-maroon">{signal.title}</span>
                      <SeverityBadge severity={signal.severity} />
                    </div>
                    <p className="text-xs text-maroon/60 mt-0.5">{signal.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-green-700 bg-green-50 rounded-lg">
              No risk signals detected — financials, insider activity, and filings look healthy
            </div>
          )}

          {/* Cross-company ranking */}
          <CompanyRiskSummary companies={companies} />
        </div>
      )}
    </div>
  );
}
