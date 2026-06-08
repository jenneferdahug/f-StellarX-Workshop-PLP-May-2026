'use client';
import { useState } from 'react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
  type AssetCode,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

type Status =
  | 'idle'
  | 'building'
  | 'signing'
  | 'submitting'
  | 'polling'
  | 'success'
  | 'error';

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Send',
  building: 'Building transaction…',
  signing: 'Waiting for Freighter…',
  submitting: 'Submitting…',
  polling: 'Confirming on-chain…',
  success: 'Send',
  error: 'Send',
};

const CATEGORIES = ['FOOD', 'RENT', 'ENTERTAINMENT', 'SAVINGS', 'OTHER'];

export default function SendPayment({
  publicKey,
  onSent,
}: {
  publicKey: string;
  onSent: () => void;
}) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<AssetCode>('XLM');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState<Status>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const busy = ['building', 'signing', 'submitting', 'polling'].includes(status);

  const handleSend = async () => {
    setStatus('building');
    setErrorMsg('');
    setTxHash('');
    try {
      const xdr = await buildPaymentXDR(
        publicKey,
        destination.trim(),
        amount,
        asset,
        category,
      );

      setStatus('signing');
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

      setStatus('submitting');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      setTxHash(hash);

      setStatus('polling');
      await pollTransaction(hash);
      setStatus('success');
      onSent();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <div className="p-4 bg-slate-950/50 rounded-b-2xl border-t border-slate-800">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value as AssetCode)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="XLM">XLM</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Recipient Address</label>
          <input
            type="text"
            placeholder="G..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-1.5 text-xs font-bold text-slate-500">{asset}</span>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={busy || !destination || !amount}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-500 disabled:opacity-50 active:scale-[0.98]"
        >
          {STATUS_LABEL[status]}
        </button>
      </div>

      {status === 'success' && (
        <div className="mt-3 rounded-lg border border-emerald-900 bg-emerald-950/30 p-3">
          <p className="text-xs font-bold text-emerald-400">✓ Sent successfully</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-[10px] font-medium text-indigo-400 hover:underline"
          >
            View receipt on Stellar Expert →
          </a>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 rounded-lg border border-rose-900 bg-rose-950/30 p-3">
          <p className="text-[10px] font-medium text-rose-400">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
