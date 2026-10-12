import {
  DatavilleEdgarFiling,
  DatavilleEdgarResponse,
  DatavilleErrorResponse,
  EdgarData,
  EdgarResult,
  InsiderTransaction,
} from '@/types/edgar';

const FALLBACK_ERROR =
  "Couldn't load this company from Dataville. Try again in a moment; if it keeps happening, contact support@dataville.com.";

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

const NON_OFFICER_ROLES = new Set(['Director', '10% Owner', 'Insider']);

/** Converts the Dataville /edgar response into the shape the components use. */
export function toEdgarData(filing: DatavilleEdgarFiling): EdgarData {
  const m = filing.metadata;

  // Each Form 4 can report several trades; the components list trades.
  const insider: InsiderTransaction[] = (m.insider_transactions ?? []).flatMap(form4 =>
    form4.transactions.map(t => ({
      owner: form4.owner_name,
      isDirector: form4.owner_role === 'Director',
      isOfficer: !NON_OFFICER_ROLES.has(form4.owner_role),
      officerTitle: form4.owner_role,
      transactionDate: t.date || form4.filing_date,
      // The API's buy/sell is Form 4's acquired/disposed code.
      transactionCode: t.type === 'buy' ? 'A' : 'D',
      sharesTraded: t.shares,
      pricePerShare: t.price_per_share ?? 0,
      sharesOwnedAfter: t.shares_owned_after ?? 0,
    })),
  );

  return {
    id: filing.id,
    title: filing.title,
    source: filing.source,
    last_updated: filing.last_updated,
    metadata: {
      cik: m.cik,
      form_type: m.form_type,
      filing_date: m.filing_date,
      report_date: m.report_date,
      accession_number: m.accession_number,
      company_info: {
        name: m.company_name,
        cik: m.cik,
        sic: m.sic ?? '',
        sicDescription: m.sic_description ?? '',
        tickers: m.tickers ?? [],
        exchanges: m.exchanges ?? [],
        entityType: '',
        category: m.category ?? '',
        stateOfIncorporation: m.state_of_incorporation ?? '',
        fiscalYearEnd: m.fiscal_year_end ?? '',
      },
      financials: m.financials,
      insider_transactions: insider,
      recent_filings: (m.recent_filings ?? []).map(f => ({
        formType: f.form,
        filingDate: f.date,
        description: f.description,
        documentUrl: f.url,
      })),
      document_url: m.document_url,
      filing_index: m.index_url,
      xbrl_facts: m.xbrl_facts_url ?? '',
    },
  };
}

/**
 * Looks up one company through this app's /api/edgar route, which calls
 * https://api.dataville.com/edgar/{query} server-side. On failure, returns the
 * Dataville API's own error message, which is written for end users.
 */
export async function fetchEdgarData(tickerOrCompany: string): Promise<EdgarResult> {
  const key = tickerOrCompany.toLowerCase();

  if (edgarCache[key] && Date.now() - edgarCache[key].timestamp < CACHE_DURATION) {
    return { data: edgarCache[key].data };
  }

  try {
    const res = await fetch(`/api/edgar/${encodeURIComponent(tickerOrCompany)}`);
    const json: DatavilleEdgarResponse | DatavilleErrorResponse = await res.json();
    if (!res.ok || json.status !== 'success') {
      // Most errors carry their message in data.error; the rate limiter's 429
      // uses a top-level message instead.
      const err = json as DatavilleErrorResponse;
      return { error: err.data?.error || err.message || FALLBACK_ERROR };
    }

    const data = toEdgarData((json as DatavilleEdgarResponse).data);
    edgarCache[key] = { data, timestamp: Date.now() };
    return { data };
  } catch {
    return { error: FALLBACK_ERROR };
  }
}

export function formatCurrency(value: string | undefined): string {
  if (!value) return '—';
  return value;
}

export function formatTransactionCode(code: string): string {
  const codes: Record<string, string> = {
    A: 'Acquired',
    D: 'Disposed',
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
