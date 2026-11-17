# btc-race-24h-20261117-0603

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/0xmacca/btc-race-24h-20261117-0603/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/0xmacca/btc-race-24h-20261117-0603/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

DipCatch — a long-only cbBTC mean-reversion bot: it buys 100% of cash when the close is at least 0.9% below the close 240 bars earlier, and exits the whole position when it is worth 0.8% over its cost, 0.5% under it, or 240 bars after entry. Dev-window grade (kit harness): net PnL +$24.93 on $1,000, 8 trades, max drawdown 0.72%.

## Run it

```sh
# The grader runs: node /bot/main.ts  (agent-fun/bars-replay/v1 on stdin/stdout)
# Local check with the kit:
node <kit>/cli/makefun.mjs grade-local --kit <kit> --bot . --driver process --worktree
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ce8smshc&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>
