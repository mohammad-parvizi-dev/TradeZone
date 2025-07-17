
import React, { useState, useEffect } from 'react';
import TickerTape from '../components/market/TickerTape';
import MarketList from '../components/market/MarketList';
import Heatmap from '../components/market/Heatmap';
import { CoinMarketData, SelectedCoin } from '../types';
import { ListIcon, GridIcon } from '../components/icons';
import { fetchWithCache } from '../utils/api';

interface MarketOverviewProps {
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ setActiveItemId, setSelectedCoin }) => {
    const [data, setData] = useState<CoinMarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'heatmap'>('list');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d';
                const result = await fetchWithCache<CoinMarketData[]>('cg-markets', url, 60);
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

    const TabButton: React.FC<{
        label: string;
        tabName: 'list' | 'heatmap';
        Icon: React.ComponentType<{ className?: string }>;
    }> = ({ label, tabName, Icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === tabName
                    ? 'bg-secondary-dark text-white border-b-2 border-accent-blue'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-xl text-gray-400">Loading Market Data...</div>
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
            <TickerTape data={data.slice(0, 25)} />

            <div>
                <div className="flex items-center border-b border-border-dark">
                    <TabButton label="Market List" tabName="list" Icon={ListIcon} />
                    <TabButton label="Heatmap" tabName="heatmap" Icon={GridIcon} />
                </div>
                <div className="mt-6">
                    {activeTab === 'list' ? <MarketList data={data} setActiveItemId={setActiveItemId} setSelectedCoin={setSelectedCoin} /> : <Heatmap data={data} />}
                </div>
            </div>
        </div>
    );
};

export default MarketOverview;
