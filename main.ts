// DipCatch: a long-only cbBTC mean-reversion bot for agent-fun/bars-replay/v1.
//
// Evidence (frozen 24h dev window, 1,440 one-minute bars, exact-integer replay):
//   - 1-minute BTC returns are noise (per-bar sigma ~6.4 bps) and a full-size
//     round trip costs ~30-37 bps (4 bps fee + 2 bps slippage + pool impact),
//     so trend-chasing EMA crosses and RSI/Bollinger entries all lose money
//     after costs on this window (EMA cross -106, Donchian -77, z-score -180).
//   - At the 4-hour scale the window mean-reverts: bars whose trailing
//     240-bar return sits in the bottom quintile (about -90 bps) recover
//     +49 bps on average over the next 120 bars; the top quintile gives back
//     -8 bps. So the bot buys the dip and lets the recovery pay the costs.
//   - Rule: buy 100% of cash when the close is at least 0.9% below the close
//     240 bars earlier; exit the whole position when it is worth 0.8% over
//     its cost, or 0.5% under it, or 240 bars after the entry bar.
//   - Dev-window result (local exact replay): net PnL +$24.59 on $1,000,
//     4 round trips, all 4 profitable (+95, +79, +70, +32 bps gross),
//     max drawdown 0.72%, profitable in both halves (+$15.83 / +$2.46).
//     Neighbouring parameters stay positive, so this is not a knife-edge fit.
//   - Verified with the kit's own harness (grade-local, process driver,
//     2026-11-17): net PnL +$24.93, 8 trades, 0 rejected, max drawdown
//     0.72%, win rate 100%, fees $3.25; L1 reproduced: true (two runs,
//     byte-identical action logs).
//   - No new entries in the last 30 bars: a late buy would be flattened at
//     the last close and would almost surely lose the round-trip cost.
//
// Determinism: pure float64 arithmetic on the closes seen so far, exact
// bigint comparisons for the exits, no clock, no environment, no randomness.
// The same bars give the same orders, run after run.

import { runBars, type BarsState, type Batch, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
/** Trailing window for the dip test, in bars (4 hours). */
const TRAIL_BARS = 240;
/** Entry when close / close[TRAIL_BARS] - 1 is below this (-0.9%). */
const DIP_THRESHOLD = -0.009;
/** Exit when the position is worth this over its cost (+0.8%), as a ratio. */
const ROI_NUM = 1008n;
const ROI_DEN = 1000n;
/** Exit when the position is worth this under its cost (-0.5%), as a ratio. */
const STOP_NUM = 995n;
const STOP_DEN = 1000n;
/** Exit this many bars after the entry bar, whatever the price. */
const MAX_HOLD_BARS = 240;
/** No new entries from this bar index on (the window has 1,440 bars). */
const LAST_ENTRY_BAR = 1410;
/** 1% past the close the order was decided on; fills move far less. */
const MAX_SLIPPAGE_BPS = 100;

/** Closes seen so far, oldest first; index k is the k-th bar received. */
const closes: number[] = [];
/** Bar index (into closes) the current position was decided on, -1 if flat. */
let entryBar = -1;

await runBars({
  onBatch(state: BarsState, batch: Batch) {
    for (const bar of batch.bars) closes.push(Number(bar.c));
    if (state.warmingUp) return [];
    const k = closes.length - 1;
    const held = state.positions.get(SYMBOL);
    if (held !== undefined) {
      const value = state.value(SYMBOL, held.qty);
      const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
      if (value * ROI_DEN >= held.cost * ROI_NUM) return [sell];
      if (value * STOP_DEN <= held.cost * STOP_NUM) return [sell];
      if (entryBar >= 0 && k - entryBar >= MAX_HOLD_BARS) return [sell];
      return [];
    }
    entryBar = -1;
    if (k >= LAST_ENTRY_BAR) return [];
    if (closes.length <= TRAIL_BARS) return [];
    if (closes[k] / closes[k - TRAIL_BARS] - 1 < DIP_THRESHOLD) {
      const notional = state.cash;
      if (notional < BigInt(state.hello.fees.min_notional_quote_units)) return [];
      entryBar = k;
      const buy: BuyInput = { side: 'buy', symbol: SYMBOL, notional_quote_units: notional, max_slippage_bps: MAX_SLIPPAGE_BPS };
      return [buy];
    }
    return [];
  },
});
