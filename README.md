# Quvanti Labs

> AI-driven quantitative strategy builder with institutional-grade backtesting, Monte Carlo simulation, and walk-forward validation.

**Live app:** [quvantilabs.com](https://quvantilabs.com)

---

## Table of Contents

1. [What Quvanti Is](#what-quvanti-is)
2. [The Problem](#the-problem)
3. [What It Does](#what-it-does)
4. [Key Features](#key-features)
5. [Architecture](#architecture)
6. [Technical Methodology](#technical-methodology)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Environment Variables](#environment-variables)
10. [Development](#development)
11. [Mobile App](#mobile-app)
12. [Database Schema](#database-schema)
13. [API Reference](#api-reference)
14. [AI Assistance](#ai-assistance)
15. [Limitations](#limitations)
16. [Roadmap](#roadmap)

---

## What Quvanti Is

Quvanti is a web and mobile application that lets anyone describe a trading strategy in plain English and receive an immediate, statistically rigorous evaluation of it. You type something like "Buy Bitcoin when the 50-day MA crosses above the 200-day MA, sell when RSI exceeds 70, with a 2% stop loss" — and within 60 seconds the system parses that into executable logic, runs it against real historical price data, and returns a full quant analysis: Sharpe ratio, max drawdown, win rate, Monte Carlo confidence bands, walk-forward degradation score, volume profile key levels, and an overfit detection flag.

The target user is anyone who has trading ideas but no background in programming or quantitative finance — retail traders, finance students, analysts who want to stress-test an intuition before paper trading it.

---

## The Problem

Retail traders and finance students routinely backtest strategies on platforms like TradingView's Pine Script or Python/pandas notebooks. The barrier is high: you need to write code, source and clean data, avoid look-ahead bias, understand statistical significance, and know what questions to even ask of the results.

More subtly, most tools that do give you a backtest give you *optimistic* results. They use the same data to both fit and evaluate the strategy — a form of data dredging that produces win rates and Sharpe ratios that evaporate in live trading. Professional quant shops have known this for decades and use walk-forward analysis, out-of-sample testing, and Monte Carlo methods to catch it. These techniques are rarely exposed to retail users in an accessible form.

Quvanti's thesis is that the *methodology* is the product. Anyone can build a backtest button. Surfacing Hurst exponent, OOS degradation, Monte Carlo ruin probability, and overfit detection in a plain-language UI is the actual work.

---

## What It Does

1. **Natural language → strategy**: User writes a strategy in plain English. A Gemini 2.5 Flash call structured-extracts it into a parsed strategy object (entry rules, exit rules, risk management, position sizing). The extraction includes an auto-retry on JSON parse failure and a deterministic fallback if the AI cannot parse the input.

2. **Real backtesting**: Point-in-time OHLCV data is fetched from CoinGecko (crypto) or yFinance (equities). The backtest engine simulates trade-by-trade execution with configurable slippage and commission. Output includes equity curve, per-trade log, Sharpe, Sortino, Calmar, and max drawdown.

3. **Quant validation layer**: After backtesting, the strategy is run through:
   - Monte Carlo simulation (1,000 GBM paths from observed μ/σ)
   - Walk-forward analysis (in-sample vs. out-of-sample Sharpe comparison)
   - Overfit detection (win rate vs. trade count heuristic + degradation ratio)
   - Volume profile (POC, VAH, VAL from VWAP clustering)
   - Hurst exponent (long-memory / mean-reversion classification)

4. **Paper trading**: Users can execute virtual trades via a paper account tracked in the database (not localStorage for the persistent version). Real-time prices are fetched on execution.

5. **AI agent system**: Users can create named "agents" — persistent strategy configurations stored in the database that can be paused, resumed, and monitored. Agents emit execution logs via a Server-Sent Events stream.

6. **Signal feed**: A signals table is populated by a generate endpoint (AI + quant engine). Signals are shown in the web and mobile UI with confidence scores and expected return estimates. Free-tier users see locked signals; Pro users see all.

7. **Strategy Lab**: A separate multi-turn conversational interface for iterating on a strategy description before committing it to an agent.

8. **Broker connectivity**: An Alpaca integration layer (API key storage, order routing, live portfolio sync) exists in the codebase. Paper trading and live routing are toggled via an execution mode switch.

---

## Key Features

- **Natural language strategy parsing** with AI structured extraction, JSON repair, and deterministic fallback
- **Real-data backtesting** using CoinGecko/yFinance OHLCV data, no look-ahead bias, point-in-time
- **Monte Carlo simulation** — 1,000 randomised GBM paths, probability of ruin, 95% confidence band
- **Walk-forward analysis** — in-sample vs. out-of-sample Sharpe, degradation percentage
- **Overfit detection** — flags strategies with suspiciously high win rates on low trade counts
- **Hurst exponent** — classifies market regime (trending / mean-reverting / random walk)
- **Volume profile** — POC, VAH, VAL from volume clustering
- **Order Flow Imbalance (OFI)** — real-time whale detection using bid/ask pressure asymmetry
- **Genetic strategy mutator** — parameter-space exploration via a mutation engine
- **Strategy Lab** — conversational strategy refinement with multi-turn context
- **Paper trading** — database-backed virtual portfolio with real-time price fills
- **AI agent system** — named persistent agents with SSE execution logs
- **Signal feed** — AI + quant generated signals with confidence and expected return
- **LLM response cache** — SHA-256 prompt hashing to avoid duplicate AI calls
- **Rate limiting** — per-endpoint middleware-level rate limiting
- **CSRF protection** — origin/referer validation for all state-changing API calls
- **Input sanitisation** — LLM injection, SQL injection, XSS, and path-traversal detection
- **Audit log** — tamper-evident chain (each log entry hashes the previous) for all sensitive actions
- **Subscription/paywall** — Paddle payment integration, Pro tier gating, license key activation
- **PWA** — service worker, manifest, offline page, install prompt
- **Mobile app** — Expo/React Native companion app with dashboard, signals, alerts, and create-agent flow

---

## Architecture

```
User (Web Browser / Expo Mobile)
        │
        ▼
┌───────────────────────────────────────────┐
│           Next.js App Router (web)        │
│  Pages: /, /dashboard, /agents/create,    │
│  /strategy-lab, /signals, /paper-trading, │
│  /analytics, /demo, /upgrade, /broker,    │
│  /admin, /activate, /pro-dashboard,       │
│  /quant-engine, /features, /settings/...  │
│                                           │
│  Middleware: CSRF + rate limiting         │
└──────────────┬────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────┐
│           API Routes (/api/*)             │
│                                           │
│  /api/agents/*       Agent CRUD + SSE    │
│  /api/strategy-lab/* Strategy parsing    │
│  /api/signals/*      Signal generation   │
│  /api/backtest/*     Backtest runner     │
│  /api/quant-engine/* Monte Carlo / OFI  │
│  /api/paper-trading/* Virtual portfolio  │
│  /api/broker/*       Alpaca integration  │
│  /api/subscription/* Paddle/tier checks  │
│  /api/admin/*        Admin operations    │
│  /api/market/price   Price lookups       │
│  /api/audit/*        Audit log writer    │
│  /api/security/*     Input sanitisation  │
│  /api/usage/*        Rate tracking       │
│  /api/rate-limit/*   Limit checks        │
└──────────┬──────────────────┬────────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌───────────────────────┐
│  Neon PostgreSQL │  │  External APIs         │
│  (Serverless)    │  │                        │
│                  │  │  CoinGecko (OHLCV)     │
│  agents          │  │  yFinance (OHLCV)      │
│  backtests       │  │  Gemini 2.5 Flash (AI) │
│  signals         │  │  Paddle (payments)     │
│  paper_positions │  │  Alpaca (broker)       │
│  paper_trades    │  └───────────────────────┘
│  execution_logs  │
│  audit_logs      │
│  llm_cache       │
│  usage_tracking  │
│  user_subs       │
│  auth_users      │
│  ...             │
└──────────────────┘
```

### Data flow: strategy creation

```
User inputs natural language strategy
  → POST /api/agents/create
  → Auth check (session)
  → Subscription + usage gate
  → Gemini 2.5 Flash (JSON extraction)
  → extractJSON() + validateStrategy() normalisation
  → fetchHistoricalData() (CoinGecko or yFinance)
  → runBacktest() — point-in-time trade simulation
  → runMonteCarloSimulation() — 1,000 GBM paths
  → runWalkForwardAnalysis() — OOS vs IS Sharpe
  → detectOverfitting() — heuristic flag
  → calculateVolumeProfile() — POC/VAH/VAL
  → calculateHurstExponent() — regime classification
  → INSERT agents + backtests to DB
  → Return full results to client
```

---

## Technical Methodology

Each technique below is implemented in the codebase (location noted) and runs on every strategy creation.

### Hurst Exponent
**What it does:** Measures long-range dependence in a price time series. H > 0.5 indicates trending (persistent) behaviour; H < 0.5 indicates mean-reverting; H ≈ 0.5 indicates a random walk.

**Why Quvanti uses it:** A momentum strategy applied to a mean-reverting asset (H < 0.5) will statistically underperform. The Hurst exponent lets users see whether the underlying market regime suits their strategy type before live trading.

**Where:** `apps/web/src/app/api/utils/marketData.js` → `calculateHurstExponent()` using R/S analysis over log-return windows. Also exposed as a client-side utility in `apps/web/src/app/api/utils/quant.js` → `computeHurstExponent()`.

---

### Monte Carlo Simulation
**What it does:** Simulates 1,000 independent price paths using Geometric Brownian Motion (GBM) with μ (drift) and σ (volatility) derived from the historical return distribution. For each path, the strategy rules are replayed to produce a final capital value. The output is a distribution of outcomes from which probability of ruin, 95% confidence bands, and expected value are extracted.

**Why Quvanti uses it:** A backtest result on a single historical path may be lucky or unlucky. Monte Carlo reveals the full range of plausible outcomes under the same strategy parameters — a standard hedge-fund risk assessment step.

**Where:** `apps/web/src/app/api/utils/monteCarloEngine.js` → `runMonteCarloSimulation()`.

---

### Walk-Forward Analysis
**What it does:** Splits historical data into rolling in-sample (IS) and out-of-sample (OOS) windows. The strategy is fitted on IS data and evaluated on OOS data. Sharpe ratio degradation = (IS Sharpe − OOS Sharpe) / IS Sharpe.

**Why Quvanti uses it:** A strategy optimised purely on historical data will curve-fit. Walk-forward analysis quantifies how much performance degrades on unseen data. Degradation > 30–40% is a strong overfit signal.

**Where:** `apps/web/src/app/api/utils/monteCarloEngine.js` → `runWalkForwardAnalysis()`.

---

### Overfit Detection
**What it does:** Applies a heuristic scoring function to detect likely curve-fitting: primarily checks whether win rate is implausibly high given trade count, and whether IS/OOS degradation crosses a threshold. Returns an overfit score (0–10) and a boolean flag.

**Why Quvanti uses it:** Retail backtesting tools routinely produce strategies with 90%+ win rates on 4 trades. Surfacing this automatically prevents users from placing real money on statistically invalid results.

**Where:** `apps/web/src/app/api/utils/monteCarloEngine.js` → `detectOverfitting()`.

---

### Volume Profile (POC / VAH / VAL)
**What it does:** Clusters historical volume by price level to identify the Point of Control (POC — highest volume price), Value Area High (VAH — upper boundary of 70% volume concentration), and Value Area Low (VAL — lower boundary).

**Why Quvanti uses it:** These levels act as statistically significant support and resistance because large proportions of historical trading occurred there. Entry/exit rules near POC have an evidential basis; arbitrary levels do not.

**Where:** `apps/web/src/app/api/utils/volumeProfile.js` → `calculateVolumeProfile()`.

---

### Order Flow Imbalance (OFI)
**What it does:** Computes the asymmetry between bid-side and ask-side order book pressure over rolling windows. Sustained OFI > 95th-percentile threshold indicates abnormally large directional interest — often indicative of institutional or algorithmic flow.

**Why Quvanti uses it:** Price moves driven by order flow imbalance are more directionally reliable than price moves in balanced books. The OFI monitor ("Whale Tracker") alerts users to potential conviction signals before price reacts.

**Where:** `apps/web/src/app/api/utils/orderFlow.js` → OFI calculation; `apps/web/src/app/api/quant-engine/ofi/route.js` → HTTP endpoint; `apps/web/src/components/WhaleTracker.jsx` → UI.

---

### Slippage Modelling
**What it does:** Estimates realistic execution cost on each simulated trade using spread (basis points) and market-impact estimation based on `sqrt(qty)` scaling. Limit orders are assigned zero slippage; market orders carry both spread and impact costs.

**Why Quvanti uses it:** Naive backtests assume fills at the exact signal price. Real execution costs can turn a profitable strategy unprofitable at scale. Including a slippage model prevents this class of unrealistic result.

**Where:** `apps/web/src/app/api/utils/realBacktest.js` and `apps/web/src/store/useOmniStore.js` → `computeSlippage()`.

---

### LLM Response Cache
**What it does:** Hashes the user's strategy prompt with SHA-256. On a cache hit in the `llm_cache` table, the stored structured strategy is returned immediately without an AI call.

**Why Quvanti uses it:** Identical prompts produce identical strategies. Caching avoids redundant LLM spend and reduces latency for common queries.

**Where:** `apps/web/src/app/api/strategy-lab/parse/route.js` and `apps/web/src/app/api/agents/create/route.js`.

---

### Audit Log with Tamper-Evident Chain
**What it does:** Every security-relevant event is written to `audit_logs` with a `lineage_hash` field computed from the SHA-256 of the previous entry's hash concatenated with the current event's content. This creates a chain where any tampering of a past entry invalidates all subsequent hashes.

**Why Quvanti uses it:** Financial application audit trails require tamper evidence. The chain design is inspired by append-only log techniques used in accounting and blockchain systems — though at a much simpler level appropriate for a web application.

**Where:** `apps/web/src/app/api/audit/log/route.js`; `lineage_hash` and `prev_hash` columns in `audit_logs` table.

---

## Project Structure

```
apps/
├── web/                          # Next.js App Router web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx          # Landing page (/)
│   │   │   ├── layout.jsx        # Root layout (fonts, global providers)
│   │   │   ├── dashboard/        # /dashboard — agent command centre
│   │   │   ├── agents/
│   │   │   │   ├── create/       # /agents/create — NL strategy input
│   │   │   │   ├── [id]/         # /agents/:id — single agent detail
│   │   │   │   └── shared/[token]/ # /agents/shared/:token — public share
│   │   │   ├── strategy-lab/     # /strategy-lab — conversational builder
│   │   │   ├── signals/          # /signals — live signal feed
│   │   │   ├── paper-trading/    # /paper-trading — virtual portfolio UI
│   │   │   ├── broker/           # /broker — live broker connection
│   │   │   ├── settings/broker/  # /settings/broker — API key management
│   │   │   ├── quant-engine/     # /quant-engine — Monte Carlo / OFI UI
│   │   │   ├── analytics/        # /analytics — portfolio analytics
│   │   │   ├── pro-dashboard/    # /pro-dashboard — Pro tier extended UI
│   │   │   ├── demo/             # /demo — live example showcase
│   │   │   ├── features/         # /features — feature overview
│   │   │   ├── upgrade/          # /upgrade — Paddle checkout CTA
│   │   │   ├── paddle-checkout/  # /paddle-checkout — checkout redirect
│   │   │   ├── activate/         # /activate — license key activation
│   │   │   ├── admin/            # /admin — admin panel (whitelist-gated)
│   │   │   ├── account/          # /account/signin, signup, logout
│   │   │   ├── privacy/          # /privacy — privacy policy
│   │   │   ├── terms/            # /terms — terms of service
│   │   │   ├── offline/          # /offline — PWA offline fallback
│   │   │   └── api/              # All API routes (see below)
│   │   │       ├── agents/       # CRUD, SSE stream, logs, metrics, share
│   │   │       ├── strategy-lab/ # NL → structured strategy parsing
│   │   │       ├── signals/      # Generate, live feed, resolve, cleanup
│   │   │       ├── backtest/     # Run + validate backtest
│   │   │       ├── quant-engine/ # Monte Carlo endpoint, OFI, genetic
│   │   │       ├── paper-trading/# Portfolio, execute, price, reset
│   │   │       ├── broker/       # Connect, orders, portfolio, key mask
│   │   │       ├── market/       # Price lookup
│   │   │       ├── subscription/ # Status + activate
│   │   │       ├── paddle/       # Webhook handler
│   │   │       ├── admin/        # Stats, users, grant-pro, whitelist
│   │   │       ├── audit/        # Audit log writer
│   │   │       ├── security/     # Anomaly detect, input sanitise
│   │   │       ├── usage/        # Check + track daily usage
│   │   │       ├── rate-limit/   # Rate limit helper
│   │   │       ├── auth/         # Expo auth bridge
│   │   │       ├── agent/        # Trust score
│   │   │       ├── user/         # Daily summary, streak, missed opps
│   │   │       └── utils/        # Shared backend utilities (see below)
│   │   ├── components/           # All React components (32 files)
│   │   ├── store/
│   │   │   ├── useAgentStore.js  # Zustand: agent list + tier gating
│   │   │   └── useOmniStore.js   # Zustand: global state (agents, paper, broker, exec)
│   │   ├── utils/
│   │   │   ├── useAuth.js        # Auth hook (credentials + social)
│   │   │   ├── useUser.js        # Current user from session
│   │   │   ├── brokerKeyMask.js  # Mask broker API keys for display
│   │   │   ├── deviceFingerprint.js # Client device fingerprinting
│   │   │   ├── sessionGuard.js   # Auth-required route guard
│   │   │   ├── terminalStore.js  # Terminal / diagnostics state
│   │   │   ├── useHandleStreamResponse.js # SSE stream reader
│   │   │   └── useUpload.js      # File upload hook
│   │   ├── auth.js               # NextAuth config + Postgres adapter
│   │   └── middleware.js         # CSRF protection + rate limiting
│   ├── public/
│   │   ├── manifest.json         # PWA manifest
│   │   └── sw.js                 # Service worker (PWA offline + caching)
│   ├── tailwind.config.js
│   └── jest.config.js
│
├── mobile/                       # Expo / React Native companion app
│   └── src/
│       ├── app/
│       │   ├── _layout.jsx       # Root layout (auth gate + React Query)
│       │   ├── index.jsx         # Splash redirect to (tabs)
│       │   ├── (tabs)/
│       │   │   ├── _layout.jsx   # Tab bar configuration (4 tabs)
│       │   │   ├── index.jsx     # Dashboard tab (agents + stats)
│       │   │   ├── signals.jsx   # Signals tab (live feed + filter)
│       │   │   ├── alerts.jsx    # Alerts tab
│       │   │   └── profile.jsx   # Profile / account tab
│       │   └── agents/
│       │       └── create.jsx    # Create agent screen
│       ├── components/
│       │   └── KeyboardAvoidingAnimatedView.jsx
│       └── utils/
│           ├── auth/             # Auth state + WebView modal
│           ├── useUpload.js
│           ├── useHandleStreamResponse.js
│           └── usePreventBack.js
│
└── README.md                     # This file

### Key backend utility files

| File | Purpose |
|---|---|
| `utils/sql.js` | Neon serverless SQL client wrapper |
| `utils/realBacktest.js` | Trade-by-trade backtest engine |
| `utils/monteCarloEngine.js` | Monte Carlo, walk-forward, overfit detection |
| `utils/marketData.js` | CoinGecko/yFinance fetch + Hurst exponent |
| `utils/volumeProfile.js` | POC / VAH / VAL calculation |
| `utils/orderFlow.js` | Order Flow Imbalance computation |
| `utils/quant.js` | Client-side quant utilities (GBM, fractional diff, stress test) |
| `utils/anomalyEngine.js` | Security anomaly scoring |
| `utils/rateLimiter.js` | In-memory + DB rate limiting |
| `utils/signalCalibration.js` | Signal confidence calibration |
| `utils/resolveSignals.js` | Signal outcome resolution |
| `utils/indicators.js` | Technical indicator calculations (RSI, MACD, EMA, BB) |
| `utils/format.js` | Number / currency formatting helpers |
| `utils/monteCarloEngine.js` | Full quant validation suite |

---

## Getting Started

### Requirements

- Node.js 18+
- pnpm (recommended) or npm
- A PostgreSQL database — [Neon](https://neon.tech) serverless works out of the box
- A Gemini API key (or configure via the platform integration)

### 1. Clone

```bash
git clone https://github.com/your-username/quvanti-labs.git
cd quvanti-labs
```

### 2. Install dependencies

```bash
# Web
cd apps/web
npm install

# Mobile (if needed)
cd ../mobile
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

See the **Environment Variables** section below for what each variable does.

### 4. Set up the database

The schema is defined by the SQL in the Database Schema section. Run the DDL statements against your PostgreSQL instance to create all tables.

### 5. Run development server

```bash
cd apps/web
npm run dev
```

The app runs at `http://localhost:3000`.

### 6. Build for production

```bash
cd apps/web
npm run build
npm start
```

---

## Environment Variables

All variables are defined in `.env.example` at the project root. Never commit your actual `.env` file.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon/Postgres connection string |
| `AUTH_SECRET` | ✅ | Random secret for signing session tokens |
| `BETTER_AUTH_SECRET` | ✅ | Same secret for Better Auth |
| `AUTH_URL` | ✅ | Canonical app URL for auth redirects |
| `BETTER_AUTH_URL` | ✅ | Same URL for Better Auth |
| `BETTER_AUTH_TRUSTED_ORIGINS` | ✅ | Allowed CORS origins |
| `NEXT_PUBLIC_CREATE_APP_URL` | ✅ | App URL used in server-side fetch |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Payment | Paddle client-side token |
| `PADDLE_WEBHOOK_SECRET` | Payment | Paddle webhook signature verification |
| `GOOGLE_API_KEY` | Optional | Google Cloud API key |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Optional | Google service account |
| `GOOGLE_PRIVATE_KEY` | Optional | Google service account private key |
| `EXPO_PUBLIC_BASE_URL` | Mobile | Base URL for mobile API calls |
| `EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Mobile | Uploadcare public key |
| `NEXT_PUBLIC_CREATE_ENV` | Dev/Prod | Environment indicator |

---

## Development

### Web

```bash
cd apps/web
npm run dev       # Development server with hot reload
npm run build     # Production build
npm run lint      # ESLint
```

### Mobile

```bash
cd apps/mobile
npx expo start        # Expo development server
npx expo start --ios  # iOS simulator
npx expo start --android # Android emulator
```

---

## Mobile App

The Expo companion app (`apps/mobile`) mirrors core functionality of the web app:

- **Dashboard tab** — agent list with P&L, win rate, subscription status
- **Signals tab** — live signal feed with buy/sell filter
- **Alerts tab** — notification-style alert list
- **Profile tab** — user info, sign out, navigation to legal pages
- **Create Agent screen** — natural language agent creation with toast feedback

Authentication in the mobile app opens a WebView to the web app's sign-in/sign-up pages, then bridges the session token back to the native app.

(Mobile Not Launched Yet - 9//24/2026)
---

## Database Schema

The full schema is in the database. Key tables and their purpose:

| Table | Purpose |
|---|---|
| `auth_users` | User accounts |
| `auth_accounts` | OAuth + credential account links (password hash stored here) |
| `auth_sessions` | Session tokens |
| `agents` | Persistent strategy agents |
| `backtests` | Backtest results per agent |
| `signals` | AI-generated trading signals |
| `signal_performance` | Signal outcome tracking (win/loss/pending) |
| `paper_portfolios` | Per-user paper trading portfolio |
| `paper_positions` | Current paper positions |
| `paper_trade_history` | Paper trade log |
| `broker_connections` | Alpaca/IBKR connection credentials (encrypted) |
| `broker_live_positions` | Synced live broker positions |
| `broker_orders` | Live/paper order history |
| `execution_logs` | Per-agent execution telemetry |
| `audit_logs` | Tamper-evident security audit chain |
| `llm_cache` | SHA-256 keyed LLM response cache |
| `usage_tracking` | Daily per-user usage counts |
| `user_subscriptions` | Subscription tier + license key status |
| `rate_limit_log` | Request log for rate limit tracking |
| `security_events` | Security anomaly events |
| `market_data` | Cached market price data |

---

## API Reference

### Agents

| Method | Route | Description |
|---|---|---|
| GET | `/api/agents/list` | List user's agents |
| POST | `/api/agents/create` | Create agent from NL prompt |
| GET/PATCH/DELETE | `/api/agents/[id]` | Get / update / delete agent |
| GET | `/api/agents/[id]/logs` | Execution log history |
| GET | `/api/agents/[id]/stream` | SSE live execution stream |
| GET | `/api/agents/[id]/quant-metrics` | Full quant analysis |
| GET | `/api/agents/[id]/audit-report` | Agent audit report |
| POST | `/api/agents/kill-switch` | Pause all active agents |
| POST | `/api/agents/liquidate` | Close all positions for agent |
| POST | `/api/agents/share` | Generate public share token |

### Strategy Lab

| Method | Route | Description |
|---|---|---|
| POST | `/api/strategy-lab/parse` | Parse NL strategy to structured JSON |

### Signals

| Method | Route | Description |
|---|---|---|
| GET | `/api/signals/live` | Active signals (tier-gated) |
| POST | `/api/signals/generate` | Generate new signals |
| POST | `/api/signals/resolve` | Mark signal outcomes |
| GET | `/api/signals/daily-summary` | Daily signal digest |
| POST | `/api/signals/cleanup` | Remove expired signals |

### Backtesting

| Method | Route | Description |
|---|---|---|
| POST | `/api/backtest/run` | Run standalone backtest |
| POST | `/api/backtest/validate` | Validate backtest parameters |

### Quant Engine

| Method | Route | Description |
|---|---|---|
| POST | `/api/quant-engine` | Full quant analysis |
| POST | `/api/quant-engine/genetic` | Genetic strategy mutation |
| GET | `/api/quant-engine/ofi` | Order Flow Imbalance data |

### Paper Trading

| Method | Route | Description |
|---|---|---|
| GET | `/api/paper-trading/portfolio` | Current paper portfolio |
| POST | `/api/paper-trading/execute` | Execute paper trade |
| GET | `/api/paper-trading/price` | Real-time price fetch |
| POST | `/api/paper-trading/reset` | Reset paper portfolio |

### Subscription

| Method | Route | Description |
|---|---|---|
| GET | `/api/subscription/status` | User tier + license status |
| POST | `/api/subscription/activate` | Activate license key |

---

## AI Assistance

This project was built with significant AI tool assistance (primarily Claude and Gemini) for scaffolding, component generation, utility functions, and iteration speed. The following were entirely human-directed:

- Product concept and core thesis (methodology as the product)
- Architecture decisions (Next.js App Router, Neon serverless, Zustand slices, SSE streaming)
- Quantitative methodology choices (which quant techniques to implement and why)
- Security design (tamper-evident audit chain, input sanitisation layer, CSRF middleware)
- Business logic (tier gating, usage limits, idempotency key on agent creation)
- UI/UX decisions (neural canvas hero, HUD overlays, terminal-style components)
- Debugging and fixing edge cases in backtest logic, Monte Carlo paths, JSON extraction
- Database schema design
- API contract design
- Integration decisions (Paddle for payments, Alpaca for brokerage, CoinGecko for data)
- Testing and verification of quant outputs

AI tools were used to accelerate implementation velocity, not to make product or methodology decisions. All generated code was reviewed, overthought, debugged, and modified before being used in production.

---

## Limitations

- **No real-money trading**: The broker integration layer exists but live order routing to real markets has not been fully validated for production use. Use paper trading mode.
- **Data source**: Crypto backtesting uses CoinGecko (free tier has rate limits). Equity data uses yFinance which is unofficial and may break.
- **Slippage model is approximate**: The sqrt(qty) market impact formula is a simplification. Actual market impact varies significantly by venue and asset.
- **LLM parsing failures**: If Gemini 2.5 Flash produces malformed JSON, the system falls back to a default RSI template. The user is notified but the parsed strategy may not match their intent exactly.
- **Walk-forward window size**: Fixed windows are used. Adaptive walk-forward windows would improve out-of-sample validity.
- **Mobile alerts**: The mobile alerts tab uses static mock data and is not yet wired to the backend alerts table.
- **No email notifications**: Alerts are in-app only; no email or push notification delivery is implemented yet.
- **Not all code is in this repository. This repository does not include Pro features' code files, env. files, possibly sensitive files and some UI and UX files. 


## Roadmap (Subject to Change)

- Wire mobile alerts tab to `/api/alerts/list`
- Adaptive walk-forward window sizing
- Pine Script / Python full export (currently skeleton only)
- Email notification delivery for alerts
- Real equity data source (replace unofficial yFinance)
- Portfolio-level Monte Carlo (multi-agent correlation)
- Expanded broker integrations (IBKR live, Coinbase)
- Backtesting for forex and commodities
- Strategy sharing marketplace (public share token system exists, UI partially built)


## Feedback
We could make mistakes, so can the AI.
Love and sincerity went into this. If something seems like an error, please report it to helloquvanti@gmail.com 
If you cant pay for the Pro subscription, don't use it as an excuse to not work better, please contact us.
We care for both expert and non-expert opinion. 

###Last Updated
9/24/2026
