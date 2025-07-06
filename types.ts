import React from 'react';

export interface MenuItemType {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: MenuItemType[];
  badge?: string;
  isLocked?: boolean;
}

export interface SelectedCoin {
  id: string; // e.g., 'bitcoin' for coins, or a unique contract ID for futures
  symbol: string; // e.g., 'BTC' for coins, or 'BTCUSDT' for futures pairs
  exchange?: string; // For futures, e.g., 'binance_futures'
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any | null;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
}

export interface DerivativeData {
    market: string;
    symbol: string;
    price: string;
    contract_type: "perpetual" | "futures";
    funding_rate: number;
    open_interest: number;
    volume_24h: number;
    // Add other potential fields for type safety
    [key: string]: any;
}

export interface FngData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
}

export interface DexProtocol {
  id: string;
  name: string;
  symbol: string;
  url: string;
  description: string | null;
  logo: string;
  chains: string[];
  gecko_id: string | null;
  cmcId: string | null;
  category: string;
  tvl: number;
  chainTvls: { [chain: string]: number };
  change_1d: number | null;
  change_7d: number | null;
  dailyVolume: number | null;
  mcap: number | null;
}

export interface ChartDataPoint {
    timestamp: number;
    value: number;
}

export interface DexPool {
  id: string; // e.g. pool address
  pairName: string; // e.g. WETH / USDC
  dex: string; // e.g. Uniswap V3
  dexSlug: string; // e.g. uniswap-v3
  chain: string;
  volume24h?: number;
  tvl: number;
  fees?: string;
  apy?: number;
  tokenLogos?: [string, string];
}

export interface PoolTrade {
    timestamp: number;
    price: number;
    amount: number; // in base token
    totalValue: number; // in USD
    side: 'buy' | 'sell';
    txId: string;
}

export interface PoolDetailsData extends DexPool {
    reserves: { token: string; amount: number; logo?: string }[];
    trades: PoolTrade[];
    apy: number;
}

export interface LiquidationEvent {
    id: string;
    exchange: string;
    pair: string;
    side: 'LONG' | 'SHORT';
    price: number;
    quantityUSD: number;
    timestamp: number;
}