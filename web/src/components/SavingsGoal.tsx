'use client';
import { useState, useEffect } from 'react';
import {
  contractConfigured,
  readSavingsState,
  buildContributeXDR,
  type SavingsState,
} from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function SavingsGoal({ publicKey }: { publicKey: string | null }) {
  const configured = contractConfigured();
  const [state, setState] = useState<SavingsState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!configured) return;
      try {
        const newState = await readSavingsState();
        if (active) setState(newState);
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to read contract');
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    return () => {
      active = false;
    };
  }, [configured]);

  const contribute = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const xdr = await buildContributeXDR(publicKey, Number(amount));
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(
          typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
        );
      }
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg('Contribution recorded on-chain!');
      setAmount('');
      
      // Manual refresh after contribution
      const newState = await readSavingsState();
      setState(newState);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Contribution failed');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="bg-slate-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-900">Deploy Contract</h3>
        <p className="mt-1 text-xs text-slate-500">
          Run the deployment script to enable your Soroban savings goal.
        </p>
        <div className="mt-4 rounded-lg bg-slate-900 p-2 text-left">
          <code className="text-[10px] text-slate-300">.\scripts\deploy.ps1</code>
        </div>
      </div>
    );
  }

  const pct =
    state && state.target > 0
      ? Math.min(100, Math.round((state.saved / state.target) * 100))
      : 0;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Savings Goal</h2>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Soroban Smart Contract</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        </div>
      )}

      {!loading && state && (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Progress</p>
                <p className="text-xl font-bold text-slate-900">{state.saved} / {state.target} <span className="text-xs font-medium text-slate-500 ml-1">Tokens</span></p>
              </div>
              <p className="text-sm font-bold text-indigo-600">{pct}%</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div
                className="h-full rounded-full bg-indigo-600 shadow-sm transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Contribute to Goal</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={contribute}
                disabled={busy || !publicKey || !amount}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 active:scale-[0.95]"
              >
                {busy ? '...' : 'Add'}
              </button>
            </div>
            {!publicKey && (
              <p className="text-[10px] text-center font-medium text-slate-400">
                Connect wallet to sign contribution
              </p>
            )}
          </div>
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-2 text-center">
          <p className="text-[10px] font-bold text-emerald-600">✓ {msg}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 p-2 text-center">
          <p className="text-[10px] font-bold text-rose-600">{error}</p>
        </div>
      )}
    </div>
  );
}
