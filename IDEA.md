# Your Project

## Idea
- **Track:** Financial Inclusion
- **Idea #:** 32 (Stellar Receipt Aggregator / Expense Tracking)
- **One-liner:** A transparent, on-chain personal expense tracker using Stellar memos for categorical spending insights.

## Problem
Many Filipinos lack access to formal banking or budgeting tools. Existing apps are often centralized, expensive, or don't provide a way to verify spending habits for credit-building or financial discipline.

## How it uses Stellar
- **Native Memos:** Uses Stellar transaction memos (`FOOD`, `RENT`, etc.) as a lightweight, decentralized, and cost-free tagging system for categorization.
- **Horizon API:** Leverages Horizon for real-time aggregation of on-chain transaction history to compute spending reports.
- **Freighter Wallet Integration:** Enables seamless, self-custodial interactions.

## What works in the demo
- [x] Connect wallet (Freighter, testnet)
- [x] Send payments with custom category memos
- [x] Real-time Budget Tracker dashboard with spending breakdown
- [x] "Midnight & Neon" dark mode UI for a modern fintech experience

## Setup / run
How a judge runs it locally:
- Network: **testnet**
- `cd web && npm install && npm run dev`
- Any other env vars / steps: Ensure Freighter is set to Testnet.

## Demo
- 2–4 min video link: _(Insert link here)_
- Public repo link: https://github.com/jenneferdahug/f-StellarX-Workshop-PLP-May-2026.git

## Submission checklist
- [x] Public GitHub repo with a license (this scaffold ships MIT — update `LICENSE`)
- [x] README explains problem, Stellar usage, and setup
- [ ] Demo video (2–4 min)
- [ ] Submitted via the workshop's official GitHub issue template
