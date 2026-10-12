import { EdgarData, InsiderTransaction, RecentFiling } from '@/types/edgar';

export interface RiskSignal {
  category: 'financial' | 'insider' | 'filing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
}

export interface RiskScore {
  overall: number; // 0-100, higher = riskier
  financial: number;
  insider: number;
  filing: number;
  signals: RiskSignal[];
}

function parseCurrency(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  if (value.includes('T')) return num * 1e12;
  if (value.includes('B')) return num * 1e9;
  if (value.includes('M')) return num * 1e6;
  if (value.includes('K')) return num * 1e3;
  return num;
}

function analyzeFinancials(data: EdgarData): { score: number; signals: RiskSignal[] } {
  const f = data.metadata?.financials;
  if (!f) return { score: 0, signals: [] };

  const signals: RiskSignal[] = [];
  let score = 0;

  const revenue = parseCurrency(f.revenue);
  const netIncome = parseCurrency(f.net_income);
  const totalAssets = parseCurrency(f.total_assets);
  const totalLiabilities = parseCurrency(f.total_liabilities);
  const equity = parseCurrency(f.stockholders_equity);
  const operatingIncome = parseCurrency(f.operating_income);

  if (netIncome !== null && netIncome < 0) {
    signals.push({
      category: 'financial',
      severity: 'high',
      title: 'Net loss reported',
      detail: `Net income is ${f.net_income}`,
    });
    score += 25;
  }

  if (operatingIncome !== null && operatingIncome < 0) {
    signals.push({
      category: 'financial',
      severity: 'high',
      title: 'Negative operating income',
      detail: `Operating income is ${f.operating_income}, indicating core business is unprofitable`,
    });
    score += 20;
  }

  if (totalLiabilities !== null && equity !== null && equity > 0) {
    const debtToEquity = totalLiabilities / equity;
    if (debtToEquity > 3) {
      signals.push({
        category: 'financial',
        severity: 'high',
        title: 'High leverage',
        detail: `Debt-to-equity ratio is ${debtToEquity.toFixed(1)}x (above 3x threshold)`,
      });
      score += 20;
    } else if (debtToEquity > 2) {
      signals.push({
        category: 'financial',
        severity: 'medium',
        title: 'Elevated leverage',
        detail: `Debt-to-equity ratio is ${debtToEquity.toFixed(1)}x`,
      });
      score += 10;
    }
  }

  if (equity !== null && equity < 0) {
    signals.push({
      category: 'financial',
      severity: 'high',
      title: 'Negative stockholders\' equity',
      detail: `Equity is ${f.stockholders_equity} — liabilities exceed assets`,
    });
    score += 30;
  }

  if (revenue !== null && netIncome !== null && revenue > 0) {
    const margin = netIncome / revenue;
    if (margin < 0.02 && margin >= 0) {
      signals.push({
        category: 'financial',
        severity: 'medium',
        title: 'Thin profit margin',
        detail: `Net margin is ${(margin * 100).toFixed(1)}%`,
      });
      score += 10;
    }
  }

  if (revenue !== null && netIncome !== null && revenue > 0 && netIncome > 0) {
    if (signals.length === 0) {
      score = Math.max(0, score - 10);
    }
  }

  return { score: Math.min(100, score), signals };
}

function analyzeInsiderActivity(data: EdgarData): { score: number; signals: RiskSignal[] } {
  const transactions = data.metadata?.insider_transactions;
  if (!transactions || transactions.length === 0) return { score: 0, signals: [] };

  const signals: RiskSignal[] = [];
  let score = 0;

  // Form 4 only says whether shares were disposed of (D) or acquired (A). A
  // disposal is usually a sale; an acquisition may be a purchase, a grant or an
  // option exercise.
  const sales = transactions.filter((t: InsiderTransaction) => t.transactionCode === 'D');
  const purchases = transactions.filter((t: InsiderTransaction) => t.transactionCode === 'A');

  if (sales.length > 0 && purchases.length === 0) {
    signals.push({
      category: 'insider',
      severity: 'medium',
      title: 'Disposal-only insider activity',
      detail: `${sales.length} insider disposal(s) with no acquisitions`,
    });
    score += 15;
  }

  const uniqueSellers = new Set(sales.map((s: InsiderTransaction) => s.owner));
  if (uniqueSellers.size >= 3) {
    signals.push({
      category: 'insider',
      severity: 'high',
      title: 'Multiple insiders disposing',
      detail: `${uniqueSellers.size} different insiders have disposed of shares`,
    });
    score += 25;
  }

  const officerSales = sales.filter((s: InsiderTransaction) => s.isOfficer);
  const largeSales = officerSales.filter(
    (s: InsiderTransaction) => s.sharesTraded > 0 && s.pricePerShare > 0 && s.sharesTraded * s.pricePerShare > 1_000_000
  );
  if (largeSales.length > 0) {
    const totalValue = largeSales.reduce(
      (sum: number, s: InsiderTransaction) => sum + s.sharesTraded * s.pricePerShare,
      0
    );
    signals.push({
      category: 'insider',
      severity: 'high',
      title: 'Large officer disposal(s)',
      detail: `${largeSales.length} disposal(s) over $1M totaling $${(totalValue / 1e6).toFixed(1)}M`,
    });
    score += 20;
  }

  if (purchases.length > sales.length && purchases.length >= 2) {
    signals.push({
      category: 'insider',
      severity: 'low',
      title: 'Net insider acquisitions',
      detail: `${purchases.length} acquisitions vs ${sales.length} disposals (acquisitions include grants and option exercises)`,
    });
    score = Math.max(0, score - 10);
  }

  return { score: Math.min(100, score), signals };
}

function analyzeFilings(data: EdgarData): { score: number; signals: RiskSignal[] } {
  const filings = data.metadata?.recent_filings;
  if (!filings || filings.length === 0) return { score: 0, signals: [] };

  const signals: RiskSignal[] = [];
  let score = 0;

  const amendments = filings.filter((f: RecentFiling) =>
    f.formType.endsWith('/A') || f.formType.endsWith('-A')
  );
  if (amendments.length > 0) {
    signals.push({
      category: 'filing',
      severity: 'high',
      title: 'Amended filing(s) detected',
      detail: `${amendments.length} amended form(s): ${amendments.map((a: RecentFiling) => a.formType).join(', ')} — may indicate restatements`,
    });
    score += 25;
  }

  const ntFilings = filings.filter((f: RecentFiling) =>
    f.formType.startsWith('NT ')
  );
  if (ntFilings.length > 0) {
    signals.push({
      category: 'filing',
      severity: 'high',
      title: 'Late filing notice(s)',
      detail: `${ntFilings.length} NT (non-timely) filing(s) — company unable to file on time`,
    });
    score += 30;
  }

  const eightKs = filings.filter((f: RecentFiling) => f.formType === '8-K');
  if (eightKs.length >= 5) {
    signals.push({
      category: 'filing',
      severity: 'medium',
      title: 'Frequent 8-K filings',
      detail: `${eightKs.length} current reports — high volume of material events`,
    });
    score += 10;
  }

  const form4s = filings.filter((f: RecentFiling) => f.formType === '4');
  if (form4s.length >= 10) {
    signals.push({
      category: 'filing',
      severity: 'low',
      title: 'High Form 4 volume',
      detail: `${form4s.length} insider transaction reports filed`,
    });
    score += 5;
  }

  return { score: Math.min(100, score), signals };
}

export function computeRiskScore(data: EdgarData): RiskScore {
  const financial = analyzeFinancials(data);
  const insider = analyzeInsiderActivity(data);
  const filing = analyzeFilings(data);

  const overall = Math.min(
    100,
    Math.round(financial.score * 0.4 + insider.score * 0.35 + filing.score * 0.25)
  );

  return {
    overall,
    financial: financial.score,
    insider: insider.score,
    filing: filing.score,
    signals: [...financial.signals, ...insider.signals, ...filing.signals],
  };
}

export function getRiskLevel(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 60) return { label: 'High', color: 'text-red-700', bgColor: 'bg-red-100' };
  if (score >= 30) return { label: 'Medium', color: 'text-amber-700', bgColor: 'bg-amber-100' };
  return { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-100' };
}
