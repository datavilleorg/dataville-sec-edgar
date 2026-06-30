# SEC Filing Analyzer

A standalone demo app that analyzes SEC EDGAR filings using the [Dataville API](https://app.dataville.com). Search by ticker or company name to view structured financial data, filing metadata, XBRL fundamentals, and automated risk scoring.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Company Search** — look up any SEC registrant by ticker symbol or company name
- **Filing Timeline** — visual timeline of recent filings across tracked companies
- **XBRL Financials** — real financial data (revenue, net income, assets, liabilities, equity, cash, EPS) parsed from SEC XBRL filings
- **Risk Analysis** — automated risk scoring based on financial ratios (60% weight) and filing patterns (40% weight)
- **Filing Details** — form type, filing dates, accession numbers, and links to SEC documents
- **Recent Filings** — latest filings across all tracked companies

## Data Sources

| Source | What it provides |
|--------|-----------------|
| **Dataville API** | Structured SEC EDGAR filing data — company info, filing metadata, form types, and document links |
| **SEC XBRL API** | Financial facts from XBRL filings — revenue, net income, balance sheet items, EPS |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Dataville](https://app.dataville.com) account (the API is called from the browser)

### Install and run

```bash
git clone https://github.com/datavilleorg/dataville-sec-filing-analyzer.git
cd dataville-sec-filing-analyzer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### How it works

1. The app loads 8 default companies (AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, JPM) on page load
2. Each company's data is fetched from the Dataville API (`/edgar/{ticker}`)
3. XBRL financial data is fetched from the SEC's public API (`data.sec.gov/api/xbrl/companyfacts/`)
4. Risk scores are computed client-side from the financial ratios and filing metadata
5. Search for any company to add it to the tracker

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Dataville branding
│   ├── page.tsx            # Main page with all sections
│   └── globals.css         # Tailwind + custom theme (cream/maroon)
├── components/edgar/
│   ├── CompanySearch.tsx    # Search input component
│   ├── CompanyFinancials.tsx # XBRL financial data display
│   ├── FilingTimeline.tsx   # Filing activity chart
│   ├── InsiderTransactions.tsx # Filing details view
│   ├── RecentFilings.tsx    # Latest filings table
│   └── RiskAnalysis.tsx     # Risk scoring and signals
├── hooks/
│   └── useEdgarData.ts     # Data fetching and state management
├── lib/
│   ├── edgarData.ts        # Dataville API client with caching
│   └── riskAnalysis.ts     # Risk scoring algorithm
└── types/
    └── edgar.ts            # TypeScript interfaces
```

## Risk Scoring

The risk score ranges from 0 (lowest) to 100 (highest), computed as:

**Financial Health (60% weight)** — from XBRL data:
- Net loss → +20 pts
- Negative operating income → +15 pts
- High leverage (D/E > 3x) → +20 pts
- Negative equity → +25 pts
- Thin profit margin (<2%) → +8 pts
- Low cash reserves → +10 pts

**Filing Patterns (40% weight)** — from filing metadata:
- Late filing notice (NT form) → +30 pts
- Amended filing → +25 pts
- Late filing (>75 day gap) → +15 pts
- 8-K current report → +10 pts
- Non-accelerated filer → +5 pts

| Level | Score Range |
|-------|------------|
| Low Risk | 0 – 29 |
| Medium Risk | 30 – 59 |
| High Risk | 60 – 100 |

## Related

- [Dataville API](https://app.dataville.com) — the API powering this demo
- [dataville-news-sentiment-tracker](https://github.com/datavilleorg/dataville-news-sentiment-tracker) — political news sentiment analysis demo
- [dataville-wiki-data-stream](https://github.com/datavilleorg/dataville-wiki-data-stream) — Wikipedia knowledge base tracker demo

## License

MIT
