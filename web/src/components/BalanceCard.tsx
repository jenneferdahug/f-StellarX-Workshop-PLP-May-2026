'use client';
import { useState, useEffect } from 'react';
import { fetchBalances, type Balances } from '@/lib/balances';

export default function BalanceCard({
  publicKey,
  refreshKey,
}: {
  publicKey: string;
  refreshKey: number;
}) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchBalances(publicKey)
      .then((b) => active && setBalances(b))
      .catch(() => active && setBalances(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [publicKey, refreshKey]);

  if (loading) {
    return (
      <div className="mt-4 grid animate-pulse grid-cols-2 gap-4">
        <div className="h-20 rounded bg-gray-200" />
        <div className="h-20 rounded bg-gray-200" />
      </div>
    );
  }

  if (balances && !balances.funded) {
    return (
      <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        This account isn’t funded yet. Click “Fund with Friendbot” above.
      </p>
    );
  }

  if (!balances) {
    return <p className="mt-4 text-sm text-red-500">Failed to load balances.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg transition-all hover:border-indigo-500/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Native Asset</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">Lumen Balance</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-white tracking-tight">{balances.xlm}</p>
            <p className="text-sm font-bold text-indigo-400">XLM</p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-indigo-500/10 transition-all group-hover:scale-110" />
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg transition-all hover:border-emerald-500/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stablecoin</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">Dollar Balance</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-white tracking-tight">{balances.usdc}</p>
            <p className="text-sm font-bold text-emerald-400">USDC</p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-500/10 transition-all group-hover:scale-110" />
      </div>
    </div>
  );
}
