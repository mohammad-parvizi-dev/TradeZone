
import React, { useState, useMemo } from 'react';
import { CoinMarketData, SelectedCoin } from '../../types';
import Sparkline from './Sparkline';
import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from '../icons';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const formatLargeNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

type SortKeys = keyof CoinMarketData | 'name';

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

interface MarketListProps {
    data: CoinMarketData[];
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const MarketList: React.FC<MarketListProps> = ({ data, setActiveItemId, setSelectedCoin }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'market_cap', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const handleRowClick = (coin: CoinMarketData) => {
        setSelectedCoin({ id: coin.id, symbol: coin.symbol.toUpperCase() });
        setActiveItemId('advanced-charting');
    };

    const filteredData = useMemo(() => {
        return data.filter(coin =>
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (key: SortKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Cryptocurrency Prices by Market Cap</h2>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
                    <input
                        type="text"
                        placeholder="Search for a crypto..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead>
                        <tr>
                            <SortableHeader label="#" sortKey="market_cap_rank" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} onSort={handleSort} className="w-1/4"/>
                            <SortableHeader label="Price" sortKey="current_price" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="1h %" sortKey="price_change_percentage_1h_in_currency" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="24h %" sortKey="price_change_percentage_24h" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="7d %" sortKey="price_change_percentage_7d_in_currency" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Market Cap" sortKey="market_cap" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Volume (24h)" sortKey="total_volume" sortConfig={sortConfig} onSort={handleSort} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">7d Chart</th>
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {paginatedData.map(coin => (
                            <tr key={coin.id} onClick={() => handleRowClick(coin)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{coin.market_cap_rank}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-3"/>
                                        <span className="font-medium text-white">{coin.name}</span>
                                        <span className="ml-2 text-gray-400 text-xs">{coin.symbol.toUpperCase()}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatCurrency(coin.current_price)}</td>
                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${coin.price_change_percentage_1h_in_currency == null ? 'text-gray-500' : coin.price_change_percentage_1h_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.price_change_percentage_1h_in_currency != null ? `${coin.price_change_percentage_1h_in_currency.toFixed(2)}%` : 'N/A'}
                                </td>
                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.price_change_percentage_24h.toFixed(2)}%
                                </td>
                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${coin.price_change_percentage_7d_in_currency == null ? 'text-gray-500' : coin.price_change_percentage_7d_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.price_change_percentage_7d_in_currency != null ? `${coin.price_change_percentage_7d_in_currency.toFixed(2)}%` : 'N/A'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatLargeNumber(coin.market_cap)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatLargeNumber(coin.total_volume)}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="w-32 h-10">
                                      <Sparkline data={coin.sparkline_in_7d.price} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                    Showing {Math.min(paginatedData.length, itemsPerPage * currentPage)} of {sortedData.length} results
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketList;
