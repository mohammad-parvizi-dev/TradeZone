
import React, { useState, useMemo } from 'react';
import { CoinMarketData, SelectedCoin } from '../../types';
import { SearchIcon } from '../icons';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const formatLargeNumber = (value: number) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

type Timeframe = '1h' | '24h' | '7d';
type MoverTab = 'gainers' | 'losers' | 'active';

interface MoversListProps {
    data: CoinMarketData[];
    timeframe: Timeframe;
    activeTab: MoverTab;
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const MoversList: React.FC<MoversListProps> = ({ data, timeframe, activeTab, setActiveItemId, setSelectedCoin }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const handleRowClick = (coin: CoinMarketData) => {
        setSelectedCoin({ id: coin.id, symbol: coin.symbol.toUpperCase() });
        setActiveItemId('advanced-charting');
    };

    const filteredData = useMemo(() => {
        setCurrentPage(1);
        return data.filter(coin =>
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getChangePercentage = (coin: CoinMarketData): number | undefined => {
        let change: number | undefined | null;
        if(activeTab === 'active') {
             change = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h;
        } else {
            switch(timeframe) {
                case '1h': change = coin.price_change_percentage_1h_in_currency; break;
                case '7d': change = coin.price_change_percentage_7d_in_currency; break;
                case '24h':
                default: change = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h; break;
            }
        }
        return change === null ? undefined : change;
    };
    
    const timeframeHeader = activeTab !== 'active' ? `${timeframe.toUpperCase()} %` : '24H %';
    
    const startResult = Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length);
    const endResult = Math.min(currentPage * itemsPerPage, filteredData.length);

    return (
        <div>
            <div className="flex justify-end items-center mb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); }}
                        className="bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{timeframeHeader}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume (24h)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {paginatedData.map((coin, index) => {
                            const change = getChangePercentage(coin);
                            return (
                                <tr key={coin.id} onClick={() => handleRowClick(coin)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-3"/>
                                            <div>
                                                <div className="font-medium text-white">{coin.name}</div>
                                                <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatCurrency(coin.current_price)}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${change !== undefined && change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {change !== undefined ? `${change.toFixed(2)}%` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatLargeNumber(coin.market_cap)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatLargeNumber(coin.total_volume)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                     {filteredData.length > 0 ? `Showing ${startResult} - ${endResult} of ${filteredData.length} results` : 'No results'}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-gray-700">
                        Previous
                    </button>
                    <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-gray-700">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoversList;