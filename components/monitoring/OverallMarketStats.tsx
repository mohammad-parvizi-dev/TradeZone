
import React, { useState, useEffect } from 'react';
import { GlobalStatsData } from '../../types';
import { fetchWithCache } from '../../utils/api';

const formatLargeNumber = (value: number, currency: 'usd' | 'btc' | 'eth' = 'usd') => {
  if (currency === 'usd') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const StatCard: React.FC<{ title: string; value: string; subvalue?: string; isLoading: boolean }> = ({ title, value, subvalue, isLoading }) => (
    <div className="bg-primary-dark p-6 rounded-lg flex-1 min-w-[280px]">
        <h3 className="text-base text-gray-400">{title}</h3>
        {isLoading ? (
            <div className="h-8 w-3/4 bg-gray-700 rounded animate-pulse mt-2"></div>
        ) : (
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
        )}
        {subvalue && !isLoading && <p className="text-sm text-gray-500 mt-1">{subvalue}</p>}
    </div>
);


const OverallMarketStats: React.FC = () => {
  const [stats, setStats] = useState<GlobalStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchWithCache<{ data: GlobalStatsData }>('cg-global', 'https://api.coingecko.com/api/v3/global', 120);
        setStats(result.data);
      } catch (err: any) {
        console.error("Failed to fetch CoinGecko global data", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGlobalData();
  }, []);

  if (error) return <div className="text-center p-8 text-red-500 bg-primary-dark rounded-lg">Error: {error}</div>;

  return (
    <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Overall Market Snapshot</h2>
        <div className="flex flex-wrap gap-6">
            <StatCard 
                title="Total Crypto Market Cap"
                value={stats ? formatLargeNumber(stats.total_market_cap.usd, 'usd') : '...'}
                isLoading={isLoading}
            />
             <StatCard 
                title="Bitcoin (BTC) Dominance"
                value={stats ? `${stats.market_cap_percentage.btc.toFixed(2)}%` : '...'}
                isLoading={isLoading}
            />
             <StatCard 
                title="Ethereum (ETH) Dominance"
                value={stats ? `${stats.market_cap_percentage.eth.toFixed(2)}%` : '...'}
                isLoading={isLoading}
            />
        </div>
    </div>
  );
};

export default OverallMarketStats;
