window.NEOCITY_CONFIG = Object.freeze({
  appVersion: "4.5.0-final",
  currency: "N Coin",

  supabase: {
    url: "https://dtmgklvimnceregmqdbs.supabase.co",
    publishableKey: "sb_publishable_LX-WIpzkf7zWW47gGapFBw_DVzekVPd"
  },

  auth: {
    google: true,
    x: true,
    telegram: true,
    callbackPath: "/",
    telegramProvider: "custom:telegram"
  },

  economy: {
    welcomeBonusHs: 80,
    freeSpin: { cooldownSeconds: 10800, minHs: 1, maxHs: 20 },
    levels: { min: 0, max: 70 },
    exchange: { from: "N Coin", to: "H/s", resetsLevelTo: 0 },
    deposit: { minimumUsd: 0.01 },
    withdrawal: {
      minimumUsd: 1.00,
      qualifyingTopupUsd: 1.00,
      payoutMode: "crypto-only",
      adminApprovalRequired: true
    },
    transactionFee: 0.1
  },

  crypto: {
    symbols: ["BTC","ETH","USDT","BNB","SOL","USDC","XRP","ADA","AVAX","DOGE"]
  },

  protection: {
    serverEnforced: true,
    turnstileRequiredForAuth: true,
    turnstileRequiredForFinancialActions: true,
    maxAccountsPerPerson: 2
  },

  endpoints: {
    me: "/api/me",
    miners: "/api/miners",
    catalog: "/api/catalog",
    pools: "/api/miners",
    referrals: "/api/referrals",
    bounties: "/api/bounties",
    bountySubmit: "/api/bounties/submit",
    health: "/api/health",
    cryptoPrices: "/api/crypto-prices",
    spin: "/api/spin",
    welcome: "/api/welcome-bonus",
    daily: "/api/daily",
    exchange: "/api/exchange",
    deposit: "/api/deposit",
    withdraw: "/api/withdraw",
    aiSupport: "/api/ai-support",
    publicConfig: "/api/public-config"
  }
});
