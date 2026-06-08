import { Horizon } from '@stellar/stellar-sdk';
import { HORIZON_URL } from './stellar';

const horizon = new Horizon.Server(HORIZON_URL);

export interface BudgetSummary {
  [category: string]: number;
}

/**
 * Fetch the last 100 transactions for the account and group spending by memo tag.
 */
export async function fetchBudgetSummary(publicKey: string): Promise<BudgetSummary> {
  const summary: BudgetSummary = {};

  try {
    const txs = await horizon
      .transactions()
      .forAccount(publicKey)
      .limit(100)
      .order('desc')
      .call();

    for (const tx of txs.records) {
      // Only count successful transactions sent BY the user
      if (!tx.successful || tx.source_account !== publicKey) continue;
      
      // We only care about TEXT memos for this simple tracker
      if (tx.memo_type !== 'text' || !tx.memo) continue;

      const category = tx.memo.toUpperCase();
      
      // Sum up all payments in this transaction
      const ops = await horizon.operations().forTransaction(tx.hash).call();
      for (const op of ops.records) {
        if (op.type === 'payment' && op.from === publicKey) {
          const amount = parseFloat(op.amount);
          summary[category] = (summary[category] || 0) + amount;
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch budget summary:', e);
  }

  return summary;
}
