'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

interface CompanySearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function CompanySearch({ onSearch, isLoading }: CompanySearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed.toUpperCase());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-maroon/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ticker (e.g. AAPL) or company name..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E5D5C5] bg-cream/50 text-maroon placeholder:text-maroon/40 focus:outline-none focus:ring-2 focus:ring-maroon/20"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-maroon text-white hover:bg-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Loading...' : 'Look up'}
      </button>
    </form>
  );
}
