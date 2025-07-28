import React, { useState, useEffect, useMemo } from 'react';
import { fetchWithCache } from '../utils/api';
import { forexPairs, FMP_API_KEY } from '../constants';
import { FmpForexQuote, ForexRate } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from '../components/icons';

type ForexTab = 'majors' | 'minors' | 'exotics';
type SortKeys = keyof Omit<ForexRate, 'date' | 'low' | 'high' | 'open'>;

const formatPrice = (value: number) => value.toFixed(5);
const formatSpread = (value: number) => (value * 10000).toFixed(2); // in pips

const TabButton: React.FC<{
    label: string;
    tabName: ForexTab;
    activeTab: ForexTab;
    onClick: (tabName: ForexTab) => void;
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

interface ForexRatesTableProps {
    setActiveItemId: (id: string) => void;
    setSelectedForexPair: (pair: string) => void;
}

const ForexRatesTable: React.FC<ForexRatesTableProps> = ({ setActiveItemId, setSelectedForexPair }) => {
    const [allRates, setAllRates] = useState<Map<string, ForexRate>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ForexTab>('majors');
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'ticker', direction: 'asc' });

    useEffect(() => {
        const fetchRates = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchWithCache<FmpForexQuote[]>(
                    'fmp-forex-all',
                    `https://financialmodelingprep.com/api/v3/fx?apikey=${FMP_API_KEY}`,
                    600 // Cache for 10 minutes
                );

                const ratesMap = new Map<string, ForexRate>();
                data.forEach(quote => {
                    const bid = parseFloat(quote.bid);
                    const ask = parseFloat(quote.ask);
                    const open = parseFloat(quote.open);

                    if (isNaN(bid) || isNaN(ask) || isNaN(open) || open === 0) return;

                    const spread = ask - bid;
                    const changesPercentage = (quote.changes / open) * 100;
                    
                    const rate: ForexRate = {
                        ...quote,
                        bid,
                        ask,
                        open,
                        low: parseFloat(quote.low),
                        high: parseFloat(quote.high),
                        spread,
                        changesPercentage
                    };
                    ratesMap.set(quote.ticker, rate);
                });
                setAllRates(ratesMap);
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching Forex rates.');
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    const currentRates = useMemo(() => {
        const targetPairs = forexPairs[activeTab];
        return targetPairs.map(pair => allRates.get(pair)).filter((rate): rate is ForexRate => !!rate);
    }, [activeTab, allRates]);

    const sortedData = useMemo(() => {
        let sortableItems = [...currentRates];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const { key, direction } = sortConfig;
                const aValue = a[key];
                const bValue = b[key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                    return 0;
                }

                return 0;
            });
        }
        return sortableItems;
    }, [currentRates, sortConfig]);

    const handleSort = (key: SortKeys) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleRowClick = (pair: string) => {
        setSelectedForexPair(pair.replace('/', ''));
        setActiveItemId('forex-full-analytical-chart');
    };

    if (loading) return <div className="flex justify-center items-center h-full"><div className="text-xl text-gray-400">Loading Forex Rates...</div></div>;
    if (error) return <div className="flex justify-center items-center h-full"><div className="text-xl text-red-500">Error: {error}</div></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Forex Rates Table</h1>
             <div className="bg-primary-dark p-6 rounded-lg">
                <div className="flex items-center border-b border-border-dark mb-4">
                    <TabButton label="Majors" tabName="majors" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton label="Minors" tabName="minors" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton label="Exotics" tabName="exotics" activeTab={activeTab} onClick={setActiveTab} />
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-dark">
                        <thead>
                            <tr>
                                <SortableHeader label="Pair" sortKey="ticker" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Bid" sortKey="bid" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Ask" sortKey="ask" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Spread" sortKey="spread" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Change" sortKey="changes" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Change %" sortKey="changesPercentage" sortConfig={sortConfig} onSort={handleSort} />
                            </tr>
                        </thead>
                         <tbody className="bg-primary-dark divide-y divide-border-dark">
                            {sortedData.map(rate => (
                                <tr key={rate.ticker} onClick={() => handleRowClick(rate.ticker)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{rate.ticker}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatPrice(rate.bid)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatPrice(rate.ask)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{formatSpread(rate.spread)}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${rate.changes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {rate.changes.toFixed(5)}
                                    </td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${rate.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {rate.changesPercentage.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {sortedData.length === 0 && (
                        <div className="text-center py-10 text-gray-500">No data available for this category.</div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ForexRatesTable;