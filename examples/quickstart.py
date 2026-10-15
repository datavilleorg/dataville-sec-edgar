"""Look up a company's latest SEC filing and financials through Dataville.

    DATAVILLE_API_KEY=dataville_... python examples/quickstart.py AAPL

Accepts a ticker or company name. Standard library only. Runs without a key
too, at anonymous rate limits.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = os.environ.get("DATAVILLE_API_BASE", "https://api.dataville.com")


def get_company(query: str) -> dict:
    req = urllib.request.Request(f"{API}/edgar/{urllib.parse.quote(query)}")
    key = os.environ.get("DATAVILLE_API_KEY")
    if key:
        req.add_header("Authorization", f"Bearer {key}")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp)["data"]
    except urllib.error.HTTPError as err:
        # Dataville error messages are written for people: show them as-is.
        body = json.load(err)
        sys.exit((body.get("data") or {}).get("error") or body.get("message"))


filing = get_company(sys.argv[1] if len(sys.argv) > 1 else "AAPL")
meta = filing["metadata"]
fin = meta.get("financials") or {}

print(filing["title"])
print(f"CIK {meta['cik']} · {', '.join(meta.get('tickers') or [])} · {meta.get('industry')}\n")
if fin:
    print(f"Financials ({fin['form']}, period ending {fin['period']}, filed {fin['filed']}):")
    for label in ("revenue", "net_income", "total_assets", "cash", "capex", "eps_diluted"):
        if fin.get(label):
            print(f"  {label.replace('_', ' ').capitalize():<14}{fin[label]}")
print("\nFiling:  ", meta["document_url"])
print("Recent:  ", ", ".join(f"{f['form']} ({f['date']})" for f in (meta.get("recent_filings") or [])[:5]))
