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
  revenue?: string;
  gross_profit?: string;
  operating_income?: string;
  net_income?: string;
  total_assets?: string;
  total_liabilities?: string;
  stockholders_equity?: string;
  cash?: string;
}

export interface InsiderTransaction {
  owner: string;
  isDirector: boolean;
  isOfficer: boolean;
  officerTitle: string;
  transactionDate: string;
  transactionCode: string;
  sharesTraded: number;
  pricePerShare: number;
  sharesOwnedAfter: number;
}

export interface RecentFiling {
  accessionNumber: string;
  formType: string;
  filingDate: string;
  reportDate: string;
  description: string;
  documentUrl: string;
}

export interface EdgarData {
  id: string;
  title: string;
  body: string;
  source: string;
  language: string;
  last_updated: string;
  entities: string[];
  metadata: {
    cik: string;
    form_type: string;
    filing_date: string;
    report_date: string;
    accession_number: string;
    company_info: CompanyInfo;
    financials: FinancialMetrics;
    insider_transactions: InsiderTransaction[];
    recent_filings: RecentFiling[];
    document_url: string;
    filing_index: string;
    xbrl_facts: string;
  };
}

export interface DatavilleEdgarResponse {
  status: string;
  account_state: string;
  data: EdgarData;
  usage: {
    requests_remaining: number;
    request_limit: number;
  };
}

export interface CompanyEntry {
  ticker: string;
  name: string;
  data: EdgarData | null;
  loading: boolean;
  error: string | null;
}
