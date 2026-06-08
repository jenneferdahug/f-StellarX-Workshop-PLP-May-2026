'use client';
import { useState, useEffect } from 'react';
import { fetchBudgetSummary, type BudgetSummary } from '@/lib/budget';

export default function BudgetTracker({
  publicKey,
  refreshKey,
}: {
  publicKey: string | null;
  refreshKey: number;
}) {
  const [summary, setSummary] = useState<BudgetSummary>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchBudgetSummary(publicKey);
      if (active) {
        setSummary(data);
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [publicKey, refreshKey]);

  const categories = Object.keys(summary).sort();
  const totalSpending = Object.values(summary).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Spending Breakdown</h2>
          <p className="text-xs text-slate-500">Analysis of your last 100 transactions</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">Total Spent</p>
          <p className="text-xl font-bold text-white">{totalSpending.toFixed(2)} XLM</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-indigo-500" />
          <p className="text-sm font-medium text-slate-400">Scanning the ledger…</p>
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-slate-950 border border-dashed border-slate-800">
          <svg className="h-10 w-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-sm font-medium text-slate-400 italic">No categorized spending found yet.</p>
          <p className="text-xs text-slate-600 mt-1">Try sending a payment with a category tag.</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((cat, idx) => {
            const colors = [
              'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 
              'bg-rose-500', 'bg-sky-500', 'bg-violet-500'
            ];
            const color = colors[idx % colors.length];
            const percentage = totalSpending > 0 ? (summary[cat] / totalSpending) * 100 : 0;

            return (
              <div key={cat} className="group rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="text-sm font-bold text-slate-200">{cat}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">{summary[cat].toFixed(2)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full ${color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-tighter text-slate-600">
                  <span>{percentage.toFixed(0)}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-8 border-t border-slate-800 pt-4 flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Real-time Blockchain Intelligence
        </p>
      </div>
    </div>
  );
}
