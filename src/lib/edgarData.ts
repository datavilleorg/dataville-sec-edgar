import { DatavilleEdgarResponse, EdgarData } from '@/types/edgar';

const DATAVILLE_API_BASE = 'https://app.dataville.com';

const edgarCache: Record<string, { data: EdgarData; timestamp: number }> = {};
const CACHE_DURATION = 10 * 60 * 1000;

export const DEFAULT_TICKERS = [
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'NVDA', name: 'Nvidia' },
  { ticker: 'META', name: 'Meta Platforms' },
  { ticker: 'JPM', name: 'JPMorgan Chase' },
];

export async function fetchEdgarData(tickerOrCompany: string): Promise<EdgarData | null> {
  const key = tickerOrCompany.toLowerCase();

  if (edgarCache[key] && Date.now() - edgarCache[key].timestamp < CACHE_DURATION) {
    return edgarCache[key].data;
  }

  try {
    const res = await fetch(`${DATAVILLE_API_BASE}/edgar/${encodeURIComponent(tickerOrCompany)}`);
    if (!res.ok) return null;

    const json: DatavilleEdgarResponse = await res.json();
    if (json.status !== 'success' || !json.data) return null;

    edgarCache[key] = { data: json.data, timestamp: Date.now() };
    return json.data;
  } catch {
    return null;
  }
}

export function formatCurrency(value: string | undefined): string {
  if (!value) return '—';
  return value;
}

export function formatTransactionCode(code: string): string {
  const codes: Record<string, string> = {
    P: 'Purchase',
    S: 'Sale',
    A: 'Grant',
    D: 'Disposition',
    M: 'Exercise',
    C: 'Conversion',
    G: 'Gift',
  };
  return codes[code] || code;
}

export function getFilingTimelineData(companies: { ticker: string; data: EdgarData | null }[]) {
  const filingsByMonth: Record<string, { month: string; count: number; forms: Record<string, number> }> = {};

  for (const company of companies) {
    if (!company.data?.metadata?.recent_filings) continue;

    for (const filing of company.data.metadata.recent_filings) {
      if (!filing.filingDate) continue;
      const month = filing.filingDate.substring(0, 7);
      if (!filingsByMonth[month]) {
        filingsByMonth[month] = { month, count: 0, forms: {} };
      }
      filingsByMonth[month].count++;
      filingsByMonth[month].forms[filing.formType] = (filingsByMonth[month].forms[filing.formType] || 0) + 1;
    }
  }

  return Object.values(filingsByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
}
