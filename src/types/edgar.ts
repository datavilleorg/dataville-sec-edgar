export interface CompanyInfo {
  sic: string;
  sicDescription: string;
  tickers: string[];
  exchanges: string[];
  name: string;
  cik: string;
  entityType: string;
  category: string;
  stateOfIncorporation: string;
  fiscalYearEnd: string;
}

export interface FinancialMetrics {
  /** Which filing the figures come from; all figures share this one period. */
  form?: string;
  period_start?: string;
  period?: string;
  filed?: string;
  revenue?: string;
  gross_profit?: string;
  operating_income?: string;
  net_income?: string;
  total_assets?: string;
  total_liabilities?: string;
  stockholders_equity?: string;
  cash?: string;
}

/**
 * One insider trade from a Form 4. Form 4s say only whether shares were
 * acquired (A) or disposed of (D); an acquisition may be a purchase, a grant
 * or an option exercise, so the app doesn't call it a "buy".
 */
export interface InsiderTransaction {
  owner: string;
  isDirector: boolean;
  isOfficer: boolean;
  officerTitle: string;
  transactionDate: string;
  transactionCode: 'A' | 'D';
  sharesTraded: number;
  pricePerShare: number;
  sharesOwnedAfter: number;
}

export interface RecentFiling {
  formType: string;
  filingDate: string;
  description: string;
  documentUrl: string;
}

/** The app's view of one company, normalized from the Dataville response. */
export interface EdgarData {
  id: string;
  title: string;
  source: string;
  last_updated: string;
  metadata: {
    cik: string;
    form_type: string;
    filing_date: string;
    report_date: string;
    accession_number: string;
    company_info: CompanyInfo;
    financials?: FinancialMetrics;
    insider_transactions: InsiderTransaction[];
    recent_filings: RecentFiling[];
    document_url: string;
    filing_index: string;
    xbrl_facts: string;
  };
}

// ── Dataville API response: GET https://api.dataville.com/edgar/{query} ──────

export interface DatavilleEdgarFiling {
  id: string;
  title: string;
  source: string;
  last_updated: string;
  metadata: {
    cik: string;
    company_name: string;
    form_type: string;
    filing_date: string;
    report_date: string;
    accession_number: string;
    document_url: string;
    index_url: string;
    xbrl_facts_url?: string;
    sic?: string;
    sic_description?: string;
    industry?: string;
    state_of_incorporation?: string;
    exchanges?: string[];
    tickers?: string[];
    category?: string;
    fiscal_year_end?: string;
    financials?: FinancialMetrics;
    recent_filings?: Array<{ form: string; date: string; description: string; url: string }>;
    insider_transactions?: Array<{
      filing_date: string;
      owner_name: string;
      owner_role: string;
      transactions: Array<{
        security: string;
        date: string;
        shares: number;
        price_per_share: number | null;
        type: 'buy' | 'sell';
        shares_owned_after: number | null;
      }>;
    }>;
  };
}

export interface DatavilleEdgarResponse {
  status: 'success';
  account_state: string;
  data: DatavilleEdgarFiling;
}

export interface DatavilleErrorResponse {
  status: string;
  data?: { error: string; code: string };
  message?: string;
}

export type EdgarResult = { data: EdgarData } | { error: string };

export interface CompanyEntry {
  ticker: string;
  name: string;
  data: EdgarData | null;
  loading: boolean;
  error: string | null;
}
