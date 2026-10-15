// Look up a company's latest SEC filing and financials through Dataville.
//
//   DATAVILLE_API_KEY=dataville_... node examples/quickstart.mjs AAPL
//
// Accepts a ticker or company name. Node 18+, no dependencies. Runs without a
// key too, at anonymous rate limits.

const API = process.env.DATAVILLE_API_BASE ?? "https://api.dataville.com";
const query = process.argv[2] ?? "AAPL";

const res = await fetch(`${API}/edgar/${encodeURIComponent(query)}`, {
  headers: process.env.DATAVILLE_API_KEY
    ? { Authorization: `Bearer ${process.env.DATAVILLE_API_KEY}` }
    : {},
});
const body = await res.json();
if (!res.ok) {
  // Dataville error messages are written for people: show them as-is.
  console.error(body.data?.error ?? body.message);
  process.exit(1);
}

const { data: filing } = body;
const meta = filing.metadata;
const fin = meta.financials ?? {};

console.log(filing.title);
console.log(`CIK ${meta.cik} · ${(meta.tickers ?? []).join(", ")} · ${meta.industry}\n`);
if (fin.form) {
  console.log(`Financials (${fin.form}, period ending ${fin.period}, filed ${fin.filed}):`);
  for (const k of ["revenue", "net_income", "total_assets", "cash", "capex", "eps_diluted"]) {
    if (fin[k]) console.log(`  ${k.replace("_", " ").padEnd(14)}${fin[k]}`);
  }
}
console.log("\nFiling:  ", meta.document_url);
console.log(
  "Recent:  ",
  (meta.recent_filings ?? []).slice(0, 5).map((f) => `${f.form} (${f.date})`).join(", "),
);
