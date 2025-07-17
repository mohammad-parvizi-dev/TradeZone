
import React, { useState, useEffect, useMemo } from 'react';
import { PeggedAsset, MergedStablecoinData, CoinMarketData } from '../../types';
import { ArrowUpIcon, ArrowDownIcon } from '../icons';
import { fetchWithCache } from '../../utils/api';

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
};

type SortKeys = keyof MergedStablecoinData;

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKeys;
    sortConfig: { key: SortKeys; direction: 'asc' | 'desc' } | null;
    onSort: (key: SortKeys) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, onSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                <span>{label}</span>
                {isSorted && (
                    <span className="ml-2">
                        {sortConfig?.direction === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                    </span>
                )}
            </div>
        </th>
    );
};


const StablecoinsTable: React.FC = () => {
    const [stablecoins, setStablecoins] = useState<MergedStablecoinData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'marketCap', direction: 'desc' });

    useEffect(() => {
        const fetchAndMergeData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Step 1: Get base list and accurate Market Cap from DefiLlama
                const llamaData = await fetchWithCache<{ peggedAssets: PeggedAsset[] }>('llama-stables', 'https://stablecoins.llama.fi/stablecoins?includePrices=true', 300);
                const usdPeggedCoins = llamaData.peggedAssets.filter(coin => coin.pegType === 'peggedUSD' && coin.circulating.peggedUSD > 100000);

                // Step 2: Get CoinGecko IDs for the next call
                const coingeckoIds = usdPeggedCoins
                    .map(coin => coin.gecko_id)
                    .filter(id => id)
                    .join(',');

                if (!coingeckoIds) {
                    throw new Error("No valid CoinGecko IDs found for stablecoins.");
                }

                // Step 3: Get price and 24h change from CoinGecko
                const geckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingeckoIds}`;
                const geckoData = await fetchWithCache<CoinMarketData[]>('cg-stable-markets', geckoUrl, 60);
                const geckoMap = new Map(geckoData.map(coin => [coin.id, coin]));

                // Step 4: Merge the data
                const mergedData: MergedStablecoinData[] = usdPeggedCoins.map(llamaCoin => {
                    const geckoCoin = llamaCoin.gecko_id ? geckoMap.get(llamaCoin.gecko_id) : undefined;
                    return {
                        id: llamaCoin.id,
                        name: llamaCoin.name,
                        symbol: llamaCoin.symbol,
                        logo: llamaCoin.logo,
                        marketCap: llamaCoin.circulating.peggedUSD,
                        price: geckoCoin ? geckoCoin.current_price : llamaCoin.price,
                        change24h: geckoCoin ? geckoCoin.price_change_percentage_24h : null,
                    };
                });
                
                setStablecoins(mergedData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndMergeData();
    }, []);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...stablecoins];
        sortableItems.sort((a, b) => {
            const { key, direction } = sortConfig;
            const aVal = a[key] ?? -Infinity;
            const bVal = b[key] ?? -Infinity;
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [stablecoins, sortConfig]);

    const handleSort = (key: SortKeys) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    if (isLoading) return <div className="text-center p-8 text-gray-400 bg-primary-dark rounded-lg">Loading Stablecoins Data...</div>;
    if (error) return <div className="text-center p-8 text-red-500 bg-primary-dark rounded-lg">Error: {error}</div>;


    return (
        <div className="bg-primary-dark p-6 rounded-lg">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                            <SortableHeader label="Stablecoin" sortKey="name" sortConfig={sortConfig} onSort={handleSort} className="w-1/3"/>
                            <SortableHeader label="Price" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="24h Change" sortKey="change24h" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Market Cap" sortKey="marketCap" sortConfig={sortConfig} onSort={handleSort} />
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {sortedData.map((coin, index) => (
                            <tr key={coin.id} className="hover:bg-secondary-dark">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {coin.logo && <img src={coin.logo} alt={coin.name} className="w-6 h-6 mr-3 rounded-full bg-gray-800"/>}
                                        <span className="font-medium text-white">{coin.name}</span>
                                        <span className="ml-2 text-gray-400 text-xs">{coin.symbol}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatPrice(coin.price)}</td>
                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${coin.change24h == null ? 'text-gray-500' : coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.change24h != null ? `${coin.change24h.toFixed(2)}%` : 'N/A'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatLargeNumber(coin.marketCap)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StablecoinsTable;
