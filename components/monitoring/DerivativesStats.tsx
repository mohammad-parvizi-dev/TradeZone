
import React, { useState, useEffect } from 'react';
import { DerivativeData } from '../../types';
import { fetchWithCache } from '../../utils/api';

const formatLargeNumber = (value: number | null | undefined, style: 'currency' | 'decimal' = 'currency') => {
    if (value === null || value === undefined) return 'N/A';
    const options: Intl.NumberFormatOptions = {
        notation: 'compact',
        maximumFractionDigits: 2,
    };
    if (style === 'currency') {
        options.style = 'currency';
        options.currency = 'USD';
    }
    return new Intl.NumberFormat('en-US', options).format(value);
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

interface DerivativesHealthStats {
    totalVolume24h: number;
    btcOpenInterestUsd: number;
}

const DerivativesStats: React.FC = () => {
  const [stats, setStats] = useState<DerivativesHealthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDerivativesData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchWithCache<DerivativeData[]>('cg-derivatives', 'https://api.coingecko.com/api/v3/derivatives', 3600);

        const totalVolume24h = data.reduce((sum, contract) => {
            return sum + (parseFloat(String(contract.volume_24h)) || 0);
        }, 0);

        const btcOpenInterestUsd = data
            .filter(c => c.symbol.startsWith('BTC'))
            .reduce((sum, contract) => {
                // The 'open_interest' field from CoinGecko is in USD
                return sum + (contract.open_interest || 0);
        }, 0);

        setStats({ totalVolume24h, btcOpenInterestUsd });

      } catch (err: any) {
        console.error("Failed to fetch derivatives data", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDerivativesData();
  }, []);

  if (error) return <div className="text-center p-8 text-red-500 bg-primary-dark rounded-lg">Error: {error}</div>;

  return (
    <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Derivatives Health Snapshot</h2>
        <div className="flex flex-wrap gap-6">
            <StatCard 
                title="24h Derivatives Volume"
                value={stats ? formatLargeNumber(stats.totalVolume24h) : '...'}
                subvalue="Total volume across all derivative contracts."
                isLoading={isLoading}
            />
            <StatCard 
                title="Bitcoin Open Interest"
                value={stats ? formatLargeNumber(stats.btcOpenInterestUsd, 'currency') : '...'}
                subvalue="Total open interest in USD for BTC contracts."
                isLoading={isLoading}
            />
        </div>
    </div>
  );
};

export default DerivativesStats;
