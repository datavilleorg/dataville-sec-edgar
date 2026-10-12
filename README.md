# Build with SEC EDGAR filings through Dataville

**Authoritative, primary-source company disclosures for your applications, without building retrieval, XBRL parsing or company-matching infrastructure.**

This repo shows how to use SEC EDGAR data through [Dataville](https://dataville.com): a 60-second API quickstart, an MCP example for agents, and a runnable filing analyzer with financials and risk scoring.

[Get a free API key](https://app.dataville.com/api-keys) · [API docs](https://app.dataville.com) · [Dataville MCP](https://github.com/datavilleorg/dataville-mcp) · [Live demo](https://app.dataville.com/use-cases/sec-filing-analyzer)

```
SEC EDGAR ──────────▶ Dataville ──────────────▶ one JSON response per company ──▶ your app
 (submissions,         (match ticker or name to     (latest filing, company profile,   (research, monitoring,
  XBRL company facts,   a company, align XBRL to     financials, recent filings,        RAG, agents)
  Form 4s)              one period, cache)           SEC document links)
```

---

## 60-second quickstart

No key is needed to try it: anonymous use allows 50 requests a day per IP address. A [free API key](https://app.dataville.com/api-keys) raises that; send it as `Authorization: Bearer $DATAVILLE_API_KEY`.

### cURL

```bash
curl "https://api.dataville.com/edgar/AAPL" \
  -H "Authorization: Bearer $DATAVILLE_API_KEY"
```

A ticker (`AAPL`), a company name (`JPMorgan Chase`) or a phrase (`Apple revenue`) all resolve to the company.

### Python (standard library only)

```bash
python examples/quickstart.py AAPL
```

### JavaScript / TypeScript (Node 18+, no dependencies)

```bash
node examples/quickstart.mjs AAPL
```

Both print the same thing:

```
Apple Inc. — 10-Q (2026-07-31)
CIK 0000320193 · AAPL · Electronic Computers (SIC 3571)

Financials (10-Q, period ending 2026-06-27, filed 2026-07-31):
  Revenue       $364.36B
  Net income    $101.46B
  Total assets  $383.27B
  Cash          $39.54B

Filing:   https://www.sec.gov/Archives/edgar/data/320193/000032019326000020/aapl-20260627.htm
Recent:   4 (2026-10-08), 4 (2026-10-05), 4 (2026-10-05), ...
```

### MCP (Claude, Cursor, VS Code, any MCP client)

Connect your agent to Dataville's hosted MCP server:

```bash
claude mcp add --transport http dataville https://api.dataville.com/mcp \
  --header "Authorization: Bearer $DATAVILLE_API_KEY"
```

Then ask it, for example: *"Using Dataville, what did Nvidia report in its latest SEC filing? Give revenue and net income with the reporting period, and link the filing."*

The agent calls `search_dataville` with `source: "edgar"`. Setup for other clients: [dataville-mcp](https://github.com/datavilleorg/dataville-mcp).

---

## Why Dataville when SEC EDGAR is free?

EDGAR's APIs are free, and the data is the real thing. Using them in an application still means:

- **Matching companies.** You have to map a ticker or name to a CIK yourself, and handle multiple share classes and renamed registrants.
- **Joining several endpoints.** Filing history, XBRL company facts and Form 4 insider filings each come from separate feeds with different shapes.
- **Making sense of XBRL.** A company-facts file holds thousands of tagged values across many periods, amendments and comparison columns. Getting "revenue for the latest quarter" means choosing tags and lining up the reporting period yourself.
- **Following the SEC's fair-access rules.** You need a declared User-Agent, a request budget (10 requests per second) and caching.

Dataville does that per call and returns one response. It has the company profile, the latest key filing, financials aligned to a single reporting period (with that period stated), recent filings, and links to the source documents.

If you're writing Python against EDGAR alone, [EdgarTools](https://github.com/dgunning/edgartools) is an excellent library. Dataville is for when you'd rather not run that layer at all, or when EDGAR is one of several sources. The same key, response shape and MCP tools cover [Wikimedia](https://github.com/datavilleorg/dataville-wikimedia), arXiv, US Census and more.

## Authoritative, primary-source data

SEC EDGAR holds what companies **officially disclosed to the regulator**: the primary source for their financials, material events, ownership and governance. That makes it authoritative in a way secondary sources aren't. It is still the company's own statement, though: quarterly (10-Q) figures are unaudited, and filings can be amended later. Dataville keeps each figure tied to its form, period and filing, so your application can say exactly where a number came from.

## Dataset card

| | |
|---|---|
| **Source** | SEC EDGAR (U.S. Securities and Exchange Commission) |
| **Provider** | SEC public APIs (`data.sec.gov`), via Dataville |
| **Coverage** | SEC registrants. The "latest filing" is the most recent 10-K, 10-Q, 8-K, 20-F, S-1 or DEF 14A |
| **Freshness** | Fetched from the SEC on request and cached for up to 30 minutes |
| **Financials** | XBRL facts aligned to one reporting period, labelled with its form, period and filing date; values are formatted strings (e.g. `"$364.36B"`) |
| **Provenance** | `metadata.document_url` (filing), `accession_number`, `cik`, `index_url`, `xbrl_facts_url` |
| **Rights** | Public U.S. government records. SEC.gov content may be copied and redistributed; filings are the filers' own statements |
| **Access** | REST (`GET /edgar/{ticker or name}`), SQL (`POST /api/v1/query`, table `edgar`), CSV/Parquet export, MCP |

## API examples

**1. Look up a company.** One call returns the company profile and its latest key filing:

```json
{
  "status": "success",
  "data": {
    "id": "edgar_0000320193-26-000020",
    "title": "Apple Inc. — 10-Q (2026-07-31)",
    "source": "sec-edgar",
    "last_updated": "2026-07-31T00:00:00.000Z",
    "metadata": {
      "cik": "0000320193",
      "company_name": "Apple Inc.",
      "tickers": ["AAPL"],
      "exchanges": ["Nasdaq"],
      "industry": "Electronic Computers (SIC 3571)",
      "form_type": "10-Q",
      "filing_date": "2026-07-31",
      "report_date": "2026-06-27",
      "accession_number": "0000320193-26-000020",
      "document_url": "https://www.sec.gov/Archives/edgar/data/320193/000032019326000020/aapl-20260627.htm",
      "financials": {
        "form": "10-Q",
        "period_start": "2025-09-28",
        "period": "2026-06-27",
        "filed": "2026-07-31",
        "revenue": "$364.36B",
        "net_income": "$101.46B",
        "total_assets": "$383.27B",
        "eps_diluted": "$6.88"
      },
      "recent_filings": [
        { "form": "4", "date": "2026-10-08", "description": "FORM 4", "url": "https://www.sec.gov/Archives/edgar/data/320193/…" }
      ]
    }
  }
}
```

The response also includes `insider_transactions` (parsed Form 4 filings) when the company has recent ones.

**2. Get the latest financials.** Read `metadata.financials`. Every figure comes from the same reporting period, named by `form`, `period_start`, `period` and `filed`. If the latest filing is an 8-K, which has no financials of its own, the figures come from the most recent 10-K or 10-Q, and these fields say which one.

**3. Watch for new disclosures.** Poll `GET /edgar/{ticker}` for a watchlist and compare `metadata.recent_filings` with what you saw last time. A new `8-K` means a material event; a new `4` means an insider trade.

**4. Query stored filings with SQL.** This needs an API key:

```bash
curl -X POST "https://api.dataville.com/api/v1/query" \
  -H "Authorization: Bearer $DATAVILLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"SELECT company_name, form_type, filing_date, document_url FROM edgar WHERE form_type = '10-K' ORDER BY filing_date DESC LIMIT 10\"}"
```

The response is `{ "rows": [...] }`. The `edgar` table holds filings Dataville has already fetched for someone's lookup, so it isn't a full mirror of EDGAR. To be sure of a specific company, use the REST call.

## What you can build

- **Company research.** A profile, the latest financials and the filing behind them, cited.
- **Disclosure monitoring.** Alerts on new 8-Ks, 10-Qs or insider trades for a watchlist.
- **Filings RAG.** Ground an LLM's answers in the actual filing, linking `document_url` for every claim.
- **Risk and peer screening.** Compare leverage, margins and filing patterns across companies (see the demo app).
- **Due-diligence agents.** Give an agent authoritative numbers through MCP, kept separate from secondary sources.

---

## Run the demo app

A Next.js filing analyzer for eight companies (AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, JPM), plus any company you search for.

```bash
git clone https://github.com/datavilleorg/dataville-sec-edgar.git
cd dataville-sec-edgar
npm install
cp .env.example .env.local   # add DATAVILLE_API_KEY (recommended)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Company search** looks up any SEC registrant by ticker or name.
- **Financials** shows the XBRL figures and the filing and period they come from.
- **Insider transactions** lists recent Form 4 trades. Form 4 only records whether shares were *acquired* or *disposed of*, so an "Acquired" row may be a purchase, a grant or an option exercise.
- **Filing timeline and recent filings** show filing activity, with links to each SEC document.
- **Risk analysis** is a score computed in the browser; see [below](#risk-scoring).

The browser never calls Dataville directly. It calls the app's own route, [`src/app/api/edgar/[query]/route.ts`](src/app/api/edgar/%5Bquery%5D/route.ts), which calls `api.dataville.com` server-side, so your key never reaches the browser. The app makes no direct calls to the SEC. The route caches each company for 10 minutes and, because the app lets visitors search any company, caps lookups at 30 per visitor every 10 minutes (`EDGAR_LOOKUPS_PER_WINDOW`). That protects your key if you deploy the demo publicly. Each page load looks up 8 companies, so without a key it uses 8 of the 50-a-day anonymous allowance.

**Stack:** [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), and the [Dataville API](https://app.dataville.com).

### Project structure

```
src/
├── app/page.tsx                  # Main page
├── app/api/edgar/[query]/route.ts  # Server-side call to the Dataville API
├── components/edgar/             # CompanySearch, CompanyFinancials, FilingTimeline,
│                                 # InsiderTransactions, RecentFilings, RiskAnalysis
├── hooks/useEdgarData.ts         # Data loading and state
├── lib/edgarData.ts              # API client: maps the Dataville response for the components
├── lib/riskAnalysis.ts           # Risk scoring
└── types/edgar.ts                # API and app types
examples/                         # API quickstarts (Python, Node)
```

### Risk scoring

A demo heuristic, not investment advice. Each component scores 0–100 (signals add up, capped at 100), and the overall score weights them:

**Financial health (40%)**, from the XBRL figures:
- Negative stockholders' equity → +30
- Net loss → +25
- Negative operating income → +20
- High leverage (debt-to-equity over 3x) → +20, or elevated (over 2x) → +10
- Thin profit margin (under 2%) → +10
- Profitable with no other signals → −10

**Insider activity (35%)**, from Form 4 trades:
- Three or more insiders disposing of shares → +25
- Officer disposals over $1M → +20
- Disposals with no acquisitions → +15
- More acquisitions than disposals (at least two) → −10

**Filing patterns (25%)**, from recent filings:
- Late filing notice (NT form) → +30
- Amended filing (/A) → +25
- Five or more 8-Ks → +10
- Ten or more Form 4s → +5

| Level | Score range |
|-------|------------|
| Low risk | 0–29 |
| Medium risk | 30–59 |
| High risk | 60–100 |

---

## Combine with other Dataville data

EDGAR tells you what a company has *officially disclosed*; Wikimedia tells you what it *is*: its history, products and people. Both come through the same Dataville interface:

```bash
curl "https://api.dataville.com/edgar/NVDA"    # authoritative: filings, XBRL financials
curl "https://api.dataville.com/wiki/Nvidia"   # context: history, products, people
```

See [`company-intelligence-agent`](https://github.com/datavilleorg/company-intelligence-agent) for a full example that keeps each claim tagged with its source, and [`dataville-wikimedia`](https://github.com/datavilleorg/dataville-wikimedia) for the Wikimedia package.

## Disclaimer

Data comes from SEC EDGAR via Dataville. This project is not affiliated with or endorsed by the U.S. Securities and Exchange Commission. Nothing here is investment advice.

The code in this repo is MIT-licensed; see [LICENSE](LICENSE).

## Start building

**[Get a free API key →](https://app.dataville.com/api-keys)** · [Explore Dataville MCP →](https://github.com/datavilleorg/dataville-mcp) · Questions: support@dataville.com
