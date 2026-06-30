'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CompanyEntry } from '@/types/edgar';
import { getFilingTimelineData } from '@/lib/edgarData';

interface FilingTimelineProps {
  companies: CompanyEntry[];
  isLoading: boolean;
}

export default function FilingTimeline({ companies, isLoading }: FilingTimelineProps) {
  const data = useMemo(() => {
    const loaded = companies.filter(c => c.data);
    return getFilingTimelineData(loaded);
  }, [companies]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-maroon">Filing Activity</h2>
        <p className="text-xs text-maroon/50 mt-1">
          Recent SEC filings across tracked companies
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto" />
            <p className="mt-2 text-sm text-maroon/70">Loading filings from Dataville API...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-maroon/50">
          No filing data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5D5C5" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#5B1A1D' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#5B1A1D' }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5D5C5',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" fill="#5B1A1D" radius={[4, 4, 0, 0]} name="Filings" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
