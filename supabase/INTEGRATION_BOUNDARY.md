# NeoCity Miner V4.5 integration boundary

GitHub source: `Chriskefas22/neocity-miner`
Vercel project: `neocity-miner`
Supabase project ref: `dtmgklvimnceregmqdbs`

## Frontend
Uses only Supabase publishable key. No service-role, Turnstile secret or AI secret belongs in public files.

## Server
Vercel `/api/*.mjs` endpoints use `SUPABASE_SERVICE_ROLE_KEY` and authenticate the user before protected operations.

## Supabase
The existing mining schema is preserved. V4.5 adds compatibility for Level 0–70, Bounty tables, atomic Free Hashrate Spin and one-time Welcome Bonus functions, plus user/catalog policies.

## Current authoritative facts from the audit
- 0.005 N Coin / H/s / active hour mining rate is active.
- 4 active pools exist: Starter, Growth, Advanced, Elite.
- Daily emission ceiling is configured at 2,450,000 N Coin with emission guard/scaling.
- `mining_products`, `membership_plans`, `items`, `shop_listings`, and `reward_rules` are currently empty.

The UI therefore never fabricates miner prices or balances.

## Auth
Google and X use Supabase OAuth providers.
Telegram uses a Supabase Custom OIDC provider with identifier `custom:telegram`.
Provider credentials must be configured in Supabase Auth.

## Turnstile
The frontend sends Turnstile tokens to protected Vercel APIs. Vercel must contain `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
Supabase Auth CAPTCHA protection should also be configured for signup/signin where supported.

## AI
AI Support is server-side and requires `OPENAI_API_KEY` in Vercel.

## Financial flow
Deposit request is pending until verified.
Withdrawal validates $1 minimum, $1 cumulative qualifying top-up, wallet availability, live crypto quote, and admin approval. It does not automatically pay a blockchain transaction; admin/payment processor remains the settlement authority.

## Important remaining data provisioning
Catalog tables are currently empty, so miner packages and membership listings must be populated in the authoritative database before users can purchase them.
Daily Bonus and N Coin → H/s exchange remain gated until their authoritative settlement rules/functions are present.
