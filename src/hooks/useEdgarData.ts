'use client';

import { useState, useEffect, useCallback } from 'react';
import { EdgarData, CompanyEntry } from '@/types/edgar';
import { fetchEdgarData, DEFAULT_TICKERS } from '@/lib/edgarData';

let globalCompanies: CompanyEntry[] = DEFAULT_TICKERS.map(t => ({
  ticker: t.ticker,
  name: t.name,
  data: null,
  loading: true,
  error: null,
}));
let globalInitialized = false;

export function useEdgarCompanies() {
  const [companies, setCompanies] = useState<CompanyEntry[]>(globalCompanies);
  const [isLoading, setIsLoading] = useState(!globalInitialized);

  const loadCompany = useCallback(async (ticker: string, name: string) => {
    setCompanies(prev => {
      const exists = prev.find(c => c.ticker === ticker);
      if (exists) return prev;
      return [...prev, { ticker, name, data: null, loading: true, error: null }];
    });
    globalCompanies = globalCompanies.find(c => c.ticker === ticker)
      ? globalCompanies
      : [...globalCompanies, { ticker, name, data: null, loading: true, error: null }];

    const data = await fetchEdgarData(ticker);

    const update = (prev: CompanyEntry[]) =>
      prev.map(c =>
        c.ticker === ticker
          ? { ...c, data, name: data?.metadata?.company_info?.name || name, loading: false, error: data ? null : 'Failed to load' }
          : c
      );

    globalCompanies = update(globalCompanies);
    setCompanies(update);
  }, []);

  useEffect(() => {
    if (globalInitialized) {
      setCompanies(globalCompanies);
      setIsLoading(false);
      return;
    }
    globalInitialized = true;

    const loadAll = async () => {
      for (let i = 0; i < DEFAULT_TICKERS.length; i += 3) {
        const batch = DEFAULT_TICKERS.slice(i, i + 3);
        await Promise.all(batch.map(t => loadCompany(t.ticker, t.name)));
        if (i + 3 < DEFAULT_TICKERS.length) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
      setIsLoading(false);
    };

    loadAll();
  }, [loadCompany]);

  return { companies, isLoading, loadCompany };
}

export function useSelectedCompany(companies: CompanyEntry[], selectedTicker: string): EdgarData | null {
  const entry = companies.find(c => c.ticker === selectedTicker);
  return entry?.data || null;
}
