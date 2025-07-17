
import React, { useState, useEffect, useMemo } from 'react';
import { CoinMarketData, SelectedCoin } from '../types';
import MoversList from '../components/market/MoversList';
import { fetchWithCache } from '../utils/api';

type MoverTab = 'gainers' | 'losers' | 'active';
type Timeframe = '1h' | '24h' | '7d';

const TabButton: React.FC<{
    label: string;
    tabName: MoverTab;
    activeTab: MoverTab;
    onClick: (tabName: MoverTab) => void;
}> = ({ label, tabName, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2
            ${activeTab === tabName
                ? 'text-white border-accent-blue'
                : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
            }`}
    >
        {label}
    </button>
);

interface MarketMoversProps {
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const MarketMovers: React.FC<MarketMoversProps> = ({ setActiveItemId, setSelectedCoin }) => {
    const [data, setData] = useState<CoinMarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<MoverTab>('gainers');
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d';
                const result = await fetchWithCache<CoinMarketData[]>('cg-markets-250', url, 60);
                setData(result);
            } catch (err: any) {
                console.error("Error fetching coin data:", err);
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        let filtered = data.filter(coin => {
            if (activeTab === 'gainers' || activeTab === 'losers') {
                 const key = `price_change_percentage_${timeframe}_in_currency` as keyof CoinMarketData;
                 return typeof coin[key] === 'number';
            }
            return true;
        });

        let sorted = [...filtered];

        switch (activeTab) {
            case 'gainers': {
                const key = `price_change_percentage_${timeframe}_in_currency`;
                sorted.sort((a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity));
                break;
            }
            case 'losers': {
                const key = `price_change_percentage_${timeframe}_in_currency`;
                sorted.sort((a, b) => (a[key] ?? Infinity) - (b[key] ?? Infinity));
                break;
            }
            case 'active':
                sorted.sort((a, b) => b.total_volume - a.total_volume);
                break;
        }
        return sorted.slice(0, 100);
    }, [data, activeTab, timeframe]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-xl text-gray-400">Loading Market Movers...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-xl text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <h1 className="text-2xl font-semibold text-white">Market Movers</h1>
            <div className="bg-primary-dark p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4 border-b border-border-dark">
                    <div className="flex items-center space-x-2">
                        <TabButton label="Top Gainers" tabName="gainers" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton label="Top Losers" tabName="losers" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton label="Most Active" tabName="active" activeTab={activeTab} onClick={setActiveTab} />
                    </div>

                    <div className="flex items-center bg-secondary-dark rounded-lg p-1" title={activeTab === 'active' ? 'Timeframe selection is not applicable for Most Active list' : ''}>
                        {(['1h', '24h', '7d'] as Timeframe[]).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                disabled={activeTab === 'active'}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${timeframe === tf && activeTab !== 'active' ? 'bg-accent-blue text-white' : 'text-gray-400'} ${activeTab === 'active' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                            >
                                {tf.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <MoversList 
                    data={sortedData} 
                    timeframe={timeframe} 
                    activeTab={activeTab} 
                    setActiveItemId={setActiveItemId}
                    setSelectedCoin={setSelectedCoin}
                />
            </div>
        </div>
    );
};

export default MarketMovers;
