import React, { useState, useEffect, useMemo } from 'react';
import { CoinMarketData, SelectedCoin } from '../../types';
import { SearchIcon } from '../icons';

interface CoinSelectionProps {
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const CoinSelection: React.FC<CoinSelectionProps> = ({ setSelectedCoin }) => {
    const [coins, setCoins] = useState<CoinMarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCoins = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false');
                if (!response.ok) {
                    throw new Error('Failed to fetch coin list');
                }
                const data: CoinMarketData[] = await response.json();
                setCoins(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCoins();
    }, []);

    const filteredCoins = useMemo(() => {
        return coins.filter(coin => 
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [coins, searchTerm]);

    if (loading) return <div className="text-center p-8 text-gray-400">Loading coins...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="bg-primary-dark p-6 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Select a Cryptocurrency for Analysis</h2>
            <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
                <input
                    type="text"
                    placeholder="Search for a crypto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead className="bg-secondary-dark sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {filteredCoins.length > 0 ? filteredCoins.map(coin => (
                            <tr 
                                key={coin.id} 
                                className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer"
                                onClick={() => setSelectedCoin({ id: coin.id, symbol: coin.symbol.toUpperCase() })}
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{coin.market_cap_rank}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-3"/>
                                        <span className="font-medium text-white">{coin.name}</span>
                                        <span className="ml-2 text-gray-400 text-xs">{coin.symbol.toUpperCase()}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono">
                                    ${coin.current_price.toLocaleString()}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="text-center py-4 text-gray-400">No coins found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoinSelection;
