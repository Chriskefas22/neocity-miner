# NeoCity Miner V4.5 Final

NeoCity Miner uses a mobile-first living-city interface with a server/data boundary.

## Connected layers
Browser → Supabase Auth → Vercel API → Supabase database/ledger.

Client JavaScript never creates production balances.

## Agreed economy
- N Coin
- Free Hashrate Spin: 3-hour cooldown, 1–20 H/s
- One-time welcome bonus: 80 H/s
- Levels 0–70
- N Coin → H/s resets level to 0 after authoritative settlement
- Minimum deposit/top-up $0.01
- Minimum withdrawal $1.00
- Cumulative qualifying top-up $1.00
- Crypto-only payout
- Admin approval
- Transaction fee 0.1

## Authentication
Google and X use Supabase built-in OAuth providers. Telegram uses Custom OIDC `custom:telegram`.

## Current audit facts
Supabase has one active mining rate of 0.005 N Coin/H/s/active hour and four active pools. Current pool rows report 0 active miners and 0 total hashrate at audit time. Catalog tables (`mining_products`, `shop_listings`, `membership_plans`, `items`, `reward_rules`) are currently empty; the UI therefore does not fabricate catalog values.

## Security
Turnstile, service-role credentials, AI keys and payment provider secrets remain server-side.
