'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import SavingsGoal from '@/components/SavingsGoal';
import BudgetTracker from '@/components/BudgetTracker';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <main className="min-h-screen w-full bg-[#020617]">
      {/* Sleek Top Navigation */}
      <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">StellarX Dashboard</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Testnet Environment</p>
              </div>
            </div>
            <ConnectWallet {...wallet} />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!publicKey && !connecting && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 py-24 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
              <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9l-6 6m0-6l6 6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Welcome to StellarX</h2>
            <p className="mx-auto mt-2 max-w-sm text-slate-400">
              Connect your Freighter wallet to access your personal budget tracker, payments, and savings goals.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
              >
                Get Freighter
              </a>
            </div>
          </div>
        )}

        {publicKey && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Main Dashboard Data (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Wallet Overview</h2>
                  <button
                    onClick={refresh}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Sync Data
                  </button>
                </div>
                <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
              </section>

              <section>
                <BudgetTracker publicKey={publicKey} refreshKey={refreshKey} />
              </section>
            </div>

            {/* Right Column: Actions & Tools (1/3) */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-1 shadow-lg">
                <div className="flex flex-col p-4">
                   <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h2>
                   <div className="flex flex-wrap gap-2">
                    <FundAccount publicKey={publicKey} onFunded={refresh} />
                    <AddTrustline publicKey={publicKey} onDone={refresh} />
                   </div>
                </div>
                <SendPayment publicKey={publicKey} onSent={refresh} />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-lg overflow-hidden">
                <SavingsGoal publicKey={publicKey} />
              </div>
            </div>
          </div>
        )}

        <footer className="mt-16 border-t border-slate-800 pt-8 pb-12 text-center">
          <p className="text-xs font-medium text-slate-500">
            StellarX Workshop Portfolio · Built with @stellar/stellar-sdk
          </p>
        </footer>
      </div>
    </main>
  );
}
